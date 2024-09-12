const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require("baileys");
const { serialize } = require("./serialize");
const { Greetings } = require("./Greetings");
const { loadMessage, saveMessage, saveChat, getName } = require("./db/StoreDb");
const { PausedChats } = require("./db");
const { getAntiLink } = require("./db/antilink");
const plugins = require("./plugins");
const config = require("../config");
const emojis = require("./reactions");
const pino = require("pino");
const path = require("path");
const fs = require("fs");

const logger = pino({ level: "silent" });
const sessionDir = "./session";

const connect = async () => {
   if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);
   const { state, saveCreds } = await useMultiFileAuthState(path.join(__basedir, sessionDir));
   const { version } = await fetchLatestBaileysVersion();

   const conn = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger,
      browser: Browsers.macOS("Desktop"),
      version,
      getMessage: async key => ((await loadMessage(key.id)) || {}).message || { conversation: null },
   });

   conn.ev
      .on("connection.update", handleConnectionUpdate(conn))
      .on("creds.update", saveCreds)
      .on("group-participants.update", data => Greetings(data, conn))
      .on("chats.update", chats => chats.forEach(saveChat))
      .on("messages.upsert", handleMessages(conn))
      .on("call", handleCall(conn))
      .on("presence.update", handlePresenceUpdate(conn));

   return conn;
};

const handleConnectionUpdate =
   conn =>
   async ({ connection, lastDisconnect }) => {
      if (connection === "open") {
         console.log("Connected");
         const { version } = require("../package.json");
         conn.sendMessage(conn.user.id, {
            text: `Bot Connected\nVersion: ${version}\nTotal Plugins: ${plugins.commands.length}\nWorktype: ${config.WORK_TYPE}`,
         });
      } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
         connect();
      }
   };

const handleMessages =
   conn =>
   async ({ messages }) => {
      const msg = await serialize(JSON.parse(JSON.stringify(messages[0])), conn);
      if (!msg) return;

      await saveMessage(messages[0], msg.sender);
      if (config.AUTO_READ) await conn.readMessages([msg.key]);
      if (config.AUTO_STATUS_READ && msg.from === "status@broadcast") await conn.readMessages([msg.key]);

      const pausedChats = await PausedChats.getPausedChats();
      if (pausedChats.some(chat => chat.chatId === msg.from) && !new RegExp(`${config.HANDLERS}( ?resume)`, "is").test(msg.body)) return;

      if (msg.isGroup) await handleGroupMessage(conn, msg);

      plugins.commands.forEach(async command => {
         if (shouldExecuteCommand(command, msg)) {
            await executeCommand(command, conn, msg);
         }
      });

      if (config.AUTO_REACT && msg.type === "chat" && emojis.length > 0) {
         await conn.sendMessage(msg.from, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } });
      }

      if (config.LOGS && msg) {
         logMessage(conn, msg);
      }
   };

const shouldExecuteCommand = (command, msg) => {
   const isPublic = config.WORK_TYPE.toLowerCase() === "public";
   return (isPublic && !command.fromMe) || msg.sudo || msg.key.fromMe || msg.devs;
};

const executeCommand = async (command, conn, msg) => {
   const handleCommand = async (Instance, args) => {
      if (typeof command.function !== "function") return;
      try {
         const whats = new Instance(conn, msg);
         await command.function(whats, ...args, msg, conn);
      } catch (err) {
         console.error("Command execution error:", err);
         const errorMessage = err.name === "AxiosError" ? `Network error: ${err.message}. Please try again later.` : `Error: ${err.message || "An error occurred while executing the command."}`;
         await conn.sendMessage(msg.from, { text: `Command execution failed.\n\n${errorMessage}\n\nIf this persists, please contact the bot administrator.` }).catch(sendError => console.error("Error sending error message:", sendError));
      }
   };

   if (msg.body && command.pattern) {
      const match = msg.body.match(command.pattern);
      if (match) {
         msg.prefix = match[1];
         msg.command = match[1] + match[2];
         await handleCommand(require("./class").Message, [match[3] || false]);
      }
   } else if (command.on === "message" || (msg.type && command.on === msg.type)) {
      const MessageClass = command.on === "message" ? require("./class").AllMessage : require("./class")[msg.type];
      if (MessageClass) {
         await handleCommand(MessageClass, [msg.body]);
      }
   }
};

const handleGroupMessage = async (conn, msg) => {
   if (!msg.isGroup) return;

   const antilink = await getAntiLink(msg.from);
   if (antilink?.enabled && msg.body) {
      const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
      if (urlPattern.test(msg.body)) {
         const isAdmin = (await conn.groupMetadata(msg.from)).participants.find(p => p.id === msg.sender)?.admin;
         if (!isAdmin) {
            if (antilink.action === "kick") {
               await conn.groupParticipantsUpdate(msg.from, [msg.sender], "remove");
            } else if (antilink.action === "warn") {
               await conn.sendMessage(msg.from, { text: `@${msg.sender.split("@")[0]}, sending links is not allowed in this group.`, mentions: [msg.sender] });
            }
            await conn.sendMessage(msg.from, { delete: msg.key });
         } else {
            await conn.sendMessage(msg.from, { text: "Warning: As an admin, please be cautious when sharing URLs." });
         }
      }
   }

   if (config.ANTIWORD && msg.body) {
      const badWords = config.ANTIWORD.split(",").map(word => word.trim().toLowerCase());
      const messageWords = msg.body.toLowerCase().split(/\s+/);
      const containsBadWord = messageWords.some(word => badWords.includes(word));

      if (containsBadWord) {
         const groupMetadata = await conn.groupMetadata(msg.from);
         const isAdmin = groupMetadata.participants.find(p => p.id === msg.sender)?.admin;
         if (!isAdmin) {
            await conn.sendMessage(msg.from, { delete: msg.key });
            await conn.sendMessage(msg.from, {
               text: `@${msg.sender.split("@")[0]}, please refrain from using inappropriate language.`,
               mentions: [msg.sender],
            });
         }
      }
   }
};

const handleCall = conn => async call => {
   if (config.ANTICALL === true || config.ANTICALL === "block") {
      for (let i of call) {
         if (i.status === "offer") {
            await conn.rejectCall(i.id, i.from);
            if (config.ANTICALL === "block") {
               await conn.updateBlockStatus(i.from, "block");
            }
         }
      }
   }
};

const handlePresenceUpdate = conn => async presence => {
   if (config.PRESENCE) {
      await conn.sendPresenceUpdate(config.PRESENCE, presence.id);
   }
};

const logMessage = async (conn, msg) => {
   const name = await getName(msg.sender);
   const isGroup = msg.from.endsWith("@g.us");
   const messageContent = msg.body || msg.type;

   if (messageContent !== undefined) {
      if (isGroup) {
         const groupName = (await conn.groupMetadata(msg.from)).subject;
         console.log(`${groupName}:\n${name}: ${messageContent}`);
      } else {
         console.log(`${name}: ${messageContent}`);
      }
   }
};

module.exports = { connect };

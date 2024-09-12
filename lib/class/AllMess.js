const { decodeJid, createInteractiveMessage, parsedJid } = require("../functions");
const Base = require("./Base");
const { writeExifWebp } = require("../sticker");
const config = require("../../config");
const ReplyMessage = require("./ReplyMessage");
const fileType = require("file-type");
const { generateWAMessageFromContent, generateWAMessage } = require("baileys");
const Message = require("./Message");
class AllMessage extends Base {
   constructor(client, data) {
      super(client);
      if (data) this._patch(data);
   }

   _patch(data) {
      this.user = decodeJid(this.client.user.id);
      this.key = data.key;
      this.isGroup = data.isGroup;
      this.prefix = config.HANDLERS;
      this.id = data.key ? data.key.id : null;
      this.jid = data.key ? data.key.remoteJid : null;
      this.message = { key: data.key, message: data.message };
      this.pushName = data.pushName;
      this.participant = parsedJid(data.sender)[0];
      try {
         this.sudo = config.SUDO.split(",").includes(this.participant.split("@")[0]);
      } catch {
         this.sudo = false;
      }
      this.fromMe = data.key ? data.key.fromMe : false;
      this.isBaileys = this.id && this.id.startsWith("BAE5");
      this.timestamp = data.messageTimestamp ? data.messageTimestamp.low || data.messageTimestamp : null;

      if (data.type) {
         const type = data.type.replace("Message", "").toLowerCase();
         const messageContent = data.message[type];
         this[type] = messageContent;

         const { contextInfo = {} } = messageContent || {};
         this.mention = contextInfo.mentionedJid || false;

         if (data.quoted) {
            if (data.message.buttonsResponseMessage) return;

            this.reply_message = new ReplyMessage(this.client, contextInfo.message || {});

            const { extendedTextMessage = {} } = data.quoted.message || {};
            this.reply_text = data.quoted.text;
            this.reply_message.type = data.quoted.type || "extendedTextMessage";
            this.reply_message.mtype = data.quoted.mtype;
            this.reply_message.mimetype = extendedTextMessage?.text?.mimetype || "text/plain";
            this.reply_message.key = data.quoted.key;
            this.reply_message.message = data.quoted.message;
            this.reply_message.mention = extendedTextMessage?.contextInfo?.mentionedJid || false;
         } else {
            this.reply_message = false;
         }
      } else {
         this.type = "baileysEmit";
      }

      return super._patch(data);
   }

   async sendMessage(jid, text, options = {}) {
      return this.client.sendMessage(jid, text, options, this);
   }
   async sendReply(text, opt = {}) {
      if (!this.jid) {
         throw new Error("No recipient JID available. Make sure this.jid is set.");
      }

      const options = {
         quoted: this,
         ...opt,
      };

      return this.client.sendMessage(this.jid, { text }, options);
   }

   async log() {
      console.log(this.data);
   }

   async sendFile(content, options = {}) {
      const { data } = await this.client.getFile(content);
      const type = (await fileType.fromBuffer(data)) || {};
      return this.client.sendMessage(this.jid, { [type.mime.split("/")[0]]: data }, options);
   }

   async reply(text, options) {
      const message = await this.client.sendMessage(this.jid, { text }, { quoted: this.data, ...options });
      return new Message(this.client, message);
   }

   async edit(newMessage) {
      const { key } = this.data;
      const { jid, client } = this;

      return await client.relayMessage(
         jid,
         {
            protocolMessage: {
               key,
               type: 14,
               editedMessage: {
                  conversation: newMessage,
               },
            },
         },
         {}
      );
   }

   async send(content, options = {}) {
      const jid = options.jid || this.jid;
      const type = options.type || this._detectType(content);

      const defaultOptions = {
         packname: "ᴀsᴛʀᴏ",
         author: "ғxᴏᴘ-ᴍᴅ",
         quoted: this,
      };

      const mergedOptions = { ...defaultOptions, ...options };

      switch (type.toLowerCase()) {
         case "text":
            return this.client.sendMessage(jid, {
               text: content,
               ...mergedOptions,
            });

         case "image":
         case "video":
         case "audio":
            const mediaContent = Buffer.isBuffer(content) ? content : { url: content };
            return this.client.sendMessage(jid, {
               [type]: mediaContent,
               ...mergedOptions,
            });

         case "template":
            const optional = await generateWAMessage(jid, content, mergedOptions);
            const message = {
               viewOnceMessage: {
                  message: {
                     ...optional.message,
                  },
               },
            };
            await this.client.relayMessage(jid, message, {
               messageId: optional.key.id,
            });
            break;

         case "interactive":
            const genMessage = createInteractiveMessage(content);
            await this.client.relayMessage(jid, genMessage.message, {
               messageId: genMessage.key.id,
            });
            break;

         case "sticker":
            const { data, mime } = await this.client.getFile(content);
            if (mime == "image/webp") {
               const buff = await writeExifWebp(data, mergedOptions);
               await this.client.sendMessage(jid, { sticker: { url: buff }, ...mergedOptions }, mergedOptions);
            } else {
               const mimePrefix = mime.split("/")[0];
               if (mimePrefix === "video" || mimePrefix === "image") {
                  await this.client.sendImageAsSticker(jid, content, mergedOptions);
               }
            }
            break;

         default:
            throw new Error(`Unsupported message type: ${type}`);
      }
   }

   async _detectType(content) {
      if (typeof content === "string") {
         if (isUrl(content)) {
            try {
               const response = await fetch(content, { method: "HEAD" });
               const contentType = response.headers.get("content-type");
               if (contentType) {
                  const [type] = contentType.split("/");
                  return ["image", "video", "audio"].includes(type) ? type : "text";
               }
            } catch (error) {
               console.error("Error detecting URL content type:", error);
            }
         }
         return "text";
      }

      if (Buffer.isBuffer(content)) {
         try {
            const type = await fileType.fromBuffer(content);
            if (type) {
               const { mime } = type;
               if (mime.startsWith("image/")) return "image";
               if (mime.startsWith("video/")) return "video";
               if (mime.startsWith("audio/")) return "audio";
               if (mime === "application/pdf") return "document";
               if (mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return "document";
               // Add more mime types as needed
            }
         } catch (error) {
            console.error("Error detecting buffer type:", error);
         }
      }

      return "text"; // Default to text if type couldn't be determined
   }

   async sendMessage(jid, content, opt = { packname: "ᴀsᴛʀᴏ", author: "ғxᴏᴘ-ᴍᴅ" }, type = "text") {
      switch (type.toLowerCase()) {
         case "text":
            return this.client.sendMessage(jid, { text: content, ...opt });
         case "image" || "photo":
            if (Buffer.isBuffer(content)) {
               return this.client.sendMessage(jid, { image: content, ...opt });
            } else if (isUrl(content)) {
               return this.client.sendMessage(jid, {
                  image: { url: content },
                  ...opt,
               });
            }
            break;
         case "video":
            if (Buffer.isBuffer(content)) {
               return this.client.sendMessage(jid, { video: content, ...opt });
            } else if (isUrl(content)) {
               return this.client.sendMessage(jid, {
                  video: { url: content },
                  ...opt,
               });
            }
            break;
         case "audio":
            if (Buffer.isBuffer(content)) {
               return this.client.sendMessage(jid, { audio: content, ...opt });
            } else if (isUrl(content)) {
               return this.client.sendMessage(jid, {
                  audio: { url: content },
                  ...opt,
               });
            }
            break;
         case "template":
            const optional = await generateWAMessage(jid, content, opt);
            const message = {
               viewOnceMessage: {
                  message: {
                     ...optional.message,
                  },
               },
            };
            await this.client.relayMessage(jid, message, {
               messageId: optional.key.id,
            });
            break;
         case "interactive":
            const genMessage = createInteractiveMessage(content);
            await this.client.relayMessage(jid, genMessage.message, {
               messageId: genMessage.key.id,
            });
            break;
         case "sticker":
            const { data, mime } = await this.client.getFile(content);
            if (mime == "image/webp") {
               const buff = await writeExifWebp(data, opt);
               await this.client.sendMessage(jid, { sticker: { url: buff }, ...opt }, opt);
            } else {
               const mimePrefix = mime.split("/")[0];
               if (mimePrefix === "video" || mimePrefix === "image") {
                  await this.client.sendImageAsSticker(this.jid, content, opt);
               }
            }
            break;
      }
   }

   async forward(jid, message, options = {}) {
      const m = generateWAMessageFromContent(jid, message, {
         ...options,
         userJid: this.client.user.id,
      });
      await this.client.relayMessage(jid, m.message, {
         messageId: m.key.id,
         ...options,
      });
      return m;
   }
}

module.exports = AllMessage;

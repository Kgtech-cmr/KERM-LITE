const { Module, serialize, parsedJid } = require("../lib/");
const { DELETED_LOG_CHAT, DELETED_LOG, STATUS_SAVER } = require("../config");
const { loadMessage, getName } = require("../lib/db/StoreDb");
const { PausedChats, WarnDB } = require("../lib/db");
const { WARN_COUNT } = require("../config");
const { saveWarn, resetWarn } = WarnDB;
const { getFilter, setFilter, deleteFilter } = require("../lib/db/filters");

Module(
   {
      pattern: "vv",
      fromMe: true,
      desc: "Forwards The View once messsage",
      type: "whatsapp",
   },
   async (message, match, m) => {
      if (!message.reply_message) return await message.reply("Reply a ViewOnce");
      let buff = await m.quoted.download();
      return await message.sendFile(buff);
   }
);

Module(
   {
      on: "text",
      fromMe: !STATUS_SAVER,
      desc: "Save or Give Status Updates",
      dontAddCommandList: true,
   },
   async (message, match, m) => {
      if (message.isGroup) return;
      const triggerKeywords = ["save", "send", "sent", "snt", "give", "snd"];
      const cmdz = match.toLowerCase().split(" ")[0];
      if (triggerKeywords.some(tr => cmdz.includes(tr))) {
         const relayOptions = { messageId: m.quoted.key.id };
         return await message.client.relayMessage(message.jid, m.quoted.message, relayOptions);
      }
   }
);

var AFK = {
   isAfk: false,
   reason: false,
   lastseen: 0,
};

function parseSecs(d) {
   d = Number(d);
   var h = Math.floor(d / 3600);
   var m = Math.floor((d % 3600) / 60);
   var s = Math.floor((d % 3600) % 60);

   var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
   var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
   var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
   return hDisplay + mDisplay + sDisplay;
}

Module(
   {
      on: "text",
      fromMe: false,
   },
   async (message, match) => {
      if (AFK.isAfk && (!message.jid.includes("@g.us") || (message.jid.includes("@g.us") && ((message.mention !== false && message.mention.length !== 0) || message.reply_message !== false)))) {
         if (message.jid.includes("@g.us") && message.mention !== false && message.mention.length !== 0) {
            message.mention.map(async jid => {
               if (message.client.user.jid.split("@")[0] === jid.split("@")[0]) {
                  await message.send("I'm currently away from keyboard." + (AFK.reason !== false ? "\n*Reason:* ```" + AFK.reason + "```" : "") + (AFK.lastseen !== 0 ? "\n*Last Seen:* ```" + parseSecs(Math.round(new Date().getTime() / 1000) - AFK.lastseen) + " ago```" : ""), {
                     quoted: message.data,
                  });
               }
            });
         } else if (message.jid.includes("@g.us") && message.reply_message !== false) {
            if (message.reply_message.jid.split("@")[0] === message.client.user.jid.split("@")[0]) {
               await message.send("I'm currently away from keyboard." + (AFK.reason !== false ? "\n*Reason:* ```" + AFK.reason + "```" : "") + (AFK.lastseen !== 0 ? "\n*Last Seen:* ```" + parseSecs(Math.round(new Date().getTime() / 1000) - AFK.lastseen) + " ago```" : ""), {
                  quoted: message.data,
               });
            }
         } else {
            await message.send("I'm currently away from keyboard." + (AFK.reason !== false ? "\n*Reason:* ```" + AFK.reason + "```" : "") + (AFK.lastseen !== 0 ? "\n*Last Seen:* ```" + parseSecs(Math.round(new Date().getTime() / 1000) - AFK.lastseen) + " ago```" : ""), {
               quoted: message.data,
            });
         }
      }
   }
);

Module(
   {
      on: "text",
      fromMe: true,
   },
   async (message, match) => {
      if (AFK.isAfk && !message.id.startsWith("3EB0")) {
         AFK.lastseen = 0;
         AFK.reason = false;
         AFK.isAfk = false;
         await message.send("I'm no longer away from keyboard.");
      }
   }
);

Module(
   {
      pattern: "afk ?(.*)",
      fromMe: true,
      desc: "Sets your status as away from keyboard (AFK).",
   },
   async (message, match) => {
      if (!AFK.isAfk) {
         AFK.lastseen = Math.round(new Date().getTime() / 1000);
         if (match !== "") {
            AFK.reason = match;
         }
         AFK.isAfk = true;

         await message.send("I'm now away from keyboard." + (AFK.reason !== false ? "\n*Reason:* ```" + AFK.reason + "```" : ""));
      }
   }
);

Module(
   {
      pattern: "pp",
      fromMe: true,
      desc: "Set profile picture",
      type: "whatsapp",
   },
   async (message, match, m) => {
      if (!message.reply_message.image) return await message.reply("_Reply to a photo Man_");
      let buff = await m.quoted.download();
      await message.setPP(message.user, buff);
      return await message.reply("> Profile Picture Updated⚡️");
   }
);

Module(
   {
      pattern: "rpp",
      fromMe: true,
      desc: "Removes Profile picture",
      type: "whatsapp",
   },
   async (message, match) => {
      await message.removePP(message.user);
      return await message.reply("> Profile Picture Removed⚡️");
   }
);

Module(
   {
      pattern: "setname",
      fromMe: true,
      desc: "Set User name",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.reply("_Enter name Bro_");
      await message.updateName(match);
      return await message.reply(`_Username Updated : ${match}_`);
   }
);

Module(
   {
      pattern: "block",
      fromMe: true,
      desc: "Block a person",
      type: "whatsapp",
   },
   async (message, match) => {
      if (message.isGroup) {
         let jid = message.mention[0] || message.reply_message.jid;
         if (!jid) return await message.reply("_Reply to a person or mention Man_");
         await message.block(jid);
         return await message.sendMessage(`_@${jid.split("@")[0]} Blocked_`, {
            mentions: [jid],
         });
      } else {
         await message.reply("> Blocked⚡️");
         return await message.block(message.jid);
      }
   }
);

Module(
   {
      pattern: "unblock",
      fromMe: true,
      desc: "Unblock a person",
      type: "whatsapp",
   },
   async (message, match) => {
      if (message.isGroup) {
         let jid = message.mention[0] || message.reply_message.jid;
         if (!jid) return await message.reply("_Reply to a person or mention Man_");
         await message.block(jid);
         return await message.sendMessage(message.jid, `_@${jid.split("@")[0]} unblocked_`, {
            mentions: [jid],
         });
      } else {
         await message.unblock(message.jid);
         return await message.reply("> User unblocked⚡️");
      }
   }
);

Module(
   {
      pattern: "jid",
      fromMe: true,
      desc: "Give jid of chat/user",
      type: "whatsapp",
   },
   async (message, match) => {
      return await message.sendMessage(message.jid, message.mention[0] || message.reply_message.jid || message.jid);
   }
);

Module(
   {
      pattern: "dlt",
      fromMe: true,
      desc: "deletes a message",
      type: "whatsapp",
   },
   async (message, match, m, client) => {
      if (message.reply_message) {
         await client.sendMessage(message.jid, {
            delete: message.reply_message.key,
         });
      } else {
         await message.reply("Please reply to a message to delete it.");
      }
   }
);
Module(
   {
      on: "delete",
      fromMe: false,
      desc: "Logs the recent deleted message",
   },
   async (message, match) => {
      if (!DELETED_LOG) return;
      if (!DELETED_LOG_CHAT) return await message.sendMessage(message.user, "Please set DELETED_LOG_CHAT in ENV to use log delete message");
      let msg = await loadMessage(message.messageId);
      if (!msg) return;
      msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
      if (!msg) return await message.reply("No deleted message found");
      let deleted = await message.forward(DELETED_LOG_CHAT, msg.message);
      var name;
      if (!msg.from.endsWith("@g.us")) {
         let getname = await getName(msg.from);
         name = `_Name : ${getname}_`;
      } else {
         let gname = (await message.client.groupMetadata(msg.from)).subject;
         let getname = await getName(msg.sender);
         name = `_Group : ${gname}_\n_Name : ${getname}_`;
      }
      return await message.sendMessage(DELETED_LOG_CHAT, `_Message Deleted_\n_From : ${msg.from}_\n${name}\n_SenderJid : ${msg.sender}_`, { quoted: deleted });
   }
);

Module(
   {
      pattern: "bio",
      fromMe: true,
      desc: "To change your profile status",
      type: "whatsapp",
   },
   async (message, match) => {
      match = match || message.reply_message.text;
      if (!match) return await message.send("*Need Status!*\n*Example: setbio Hey there! I Love using KermLite⚡️*.");
      await message.client.updateProfileStatus(match);
      await message.reply("> Profile bio updated⚡️");
   }
);

Module(
   {
      pattern: "forward",
      fromMe: true,
      desc: "Forwards the replied message",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!message.quoted) return await message.reply("Reply to message");
      if (!match) return await message.reply("*Provide a JID; use 'jid' command to get JID*");
      let jids = parsedJid(match);
      for (let jid of jids) {
         await message.client.forwardMessage(jid, message.reply_message.message);
      }
      await message.reply("> Message forwarded⚡️");
   }
);

Module(
   {
      pattern: "caption ?(.*)",
      fromMe: true,
      desc: "Change video or image caption",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!message.reply_message.video && !message.reply_message.image && !message.image && !message.video) return await message.reply("*_Reply to an image or video_*");
      if (!match) return await message.reply("*Need a query, e.g., .caption Hello*");
      await message.send(message.jid, message.quoted ? message.reply_message.message : message.message, { caption: match });
   }
);

Module(
   {
      pattern: "getprivacy ?(.*)",
      fromMe: true,
      desc: "get your privacy settings",
      type: "whatsapp",
   },
   async (message, match) => {
      const { readreceipts, profile, status, online, last, groupadd, calladd } = await message.client.fetchPrivacySettings(true);
      const msg = `*シ my privacy*\n\n*༒ name :* ${message.client.user.name}\n*༒ online:* ${online}\n*༒ profile :* ${profile}\n*༒ last seen :* ${last}\n*༒ read receipt :* ${readreceipts}\n*༒ about seted time :*\n*༒ group add settings :* ${groupadd}\n*༒ call add settings :* ${calladd}`;
      let img = await message.client.profilePictureUrl(message.user.jid, "image").catch(() => "https://i.ibb.co/sFjZh7S/6883ac4d6a92.jpg");
      await message.send(img, { caption: msg }, "image");
   }
);

Module(
   {
      pattern: "lastseen ?(.*)",
      fromMe: true,
      desc: "to change lastseen privacy",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.send(`_*Example:-* ${message.prefix} all_\n_to change last seen privacy settings_`);
      const available_privacy = ["all", "contacts", "contact_blacklist", "none"];
      if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join("/")}* values_`);
      await message.client.updateLastSeenPrivacy(match);
      await message.send(`_Privacy settings *last seen* Updated to *${match}*_`);
   }
);

Module(
   {
      pattern: "online ?(.*)",
      fromMe: true,
      desc: "to change online privacy",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.send(`_*Example:-* ${message.prefix} all_\n_to change *online*  privacy settings_`);
      const available_privacy = ["all", "match_last_seen"];
      if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join("/")}* values_`);
      await message.client.updateOnlinePrivacy(match);
      await message.send(`_Privacy Updated to *${match}*_`);
   }
);

Module(
   {
      pattern: "mypp ?(.*)",
      fromMe: true,
      desc: "privacy setting profile picture",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.send(`_*Example:-* ${message.prefix} all_\n_to change *profile picture*  privacy settings_`);
      const available_privacy = ["all", "contacts", "contact_blacklist", "none"];
      if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join("/")}* values_`);
      await message.client.updateProfilePicturePrivacy(match);
      await message.send(`_Privacy Updated to *${match}*_`);
   }
);

Module(
   {
      pattern: "mystatus ?(.*)",
      fromMe: true,
      desc: "privacy for my status",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.send(`_*Example:-* ${message.prefix} all_\n_to change *status*  privacy settings_`);
      const available_privacy = ["all", "contacts", "contact_blacklist", "none"];
      if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join("/")}* values_`);
      await message.client.updateStatusPrivacy(match);
      await message.send(`_Privacy Updated to *${match}*_`);
   }
);

Module(
   {
      pattern: "read ?(.*)",
      fromMe: true,
      desc: "privacy for read message",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.send(`_*Example:-* ${message.prefix} all_\n_to change *read and receipts message*  privacy settings_`);
      const available_privacy = ["all", "none"];
      if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join("/")}* values_`);
      await message.client.updateReadReceiptsPrivacy(match);
      await message.send(`_Privacy Updated to *${match}*_`);
   }
);

Module(
   {
      pattern: "groupadd ?(.*)",
      fromMe: true,
      desc: "privacy for group add",
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.send(`_*Example:-* ${message.prefix} all_\n_to change *group add*  privacy settings_`);
      const available_privacy = ["all", "contacts", "contact_blacklist", "none"];
      if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join("/")}* values_`);
      await message.client.updateGroupsAddPrivacy(match);
      await message.send(`_Privacy Updated to *${match}*_`);
   }
);

Module(
   {
      pattern: "quoted",
      fromMe: true,
      desc: "quoted message",
      type: "whatsapp",
   },
   async message => {
      if (!message.reply_message) return await message.reply("_Reply to a message Man_");
      let key = message.reply_message.key;
      let msg = await loadMessage(key.id);
      if (!msg) return await message.reply("> Message not found maybe bot might not be running at that time");
      msg = await serialize(JSON.parse(JSON.stringify(msg.message)), message.client);
      if (!msg.quoted) return await message.reply("No quoted message found");
      await message.forward(message.jid, msg.quoted.message);
   }
);

Module(
   {
      pattern: "pause",
      fromMe: true,
      desc: "Pause the chat",
      type: "whatsapp",
   },
   async message => {
      const chatId = message.key.remoteJid;
      try {
         await PausedChats.savePausedChat(chatId);
         message.reply("Chat paused successfully.");
      } catch (error) {
         console.error(error);
         message.reply("Error pausing the chat.");
      }
   }
);

Module(
   {
      pattern: "resume",
      fromMe: true,
      desc: "Resume the paused chat",
      type: "whatsapp",
   },
   async message => {
      const chatId = message.key.remoteJid;

      try {
         const pausedChat = await PausedChats.PausedChats.findOne({
            where: { chatId },
         });

         if (pausedChat) {
            await pausedChat.destroy();
            message.reply("Chat resumed successfully.");
         } else {
            message.reply("Chat is not paused.");
         }
      } catch (error) {
         console.error(error);
         message.reply("Error resuming the chat.");
      }
   }
);

Module(
   {
      pattern: "warn",
      fromMe: true,
      desc: "Warn a user",
      type: "whatsapp",
   },
   async (message, match) => {
      const userId = message.mention[0] || message.reply_message.jid;
      if (!userId) return message.reply("_Mention or reply to someone Man_");
      let reason = message?.reply_message.text || match;
      reason = reason.replace(/@(\d+)/, "");
      reason = reason ? reason.length <= 1 : "Reason not Provided";

      const warnInfo = await saveWarn(userId, reason);
      let userWarnCount = warnInfo ? warnInfo.warnCount : 0;
      userWarnCount++;
      await message.reply(`_User @${userId.split("@")[0]} warned._ \n_Warn Count: ${userWarnCount}._ \n_Reason: ${reason}_`, { mentions: [userId] });
      if (userWarnCount > WARN_COUNT) {
         const jid = parsedJid(userId);
         await message.sendMessage(message.jid, "Warn limit exceeded kicking user");
         return await message.client.groupParticipantsUpdate(message.jid, jid, "remove");
      }
      return;
   }
);

Module(
   {
      pattern: "rwarn",
      fromMe: true,
      desc: "Reset warnings for a user",
      type: "whatsapp",
   },
   async message => {
      const userId = message.mention[0] || message.reply_message.jid;
      if (!userId) return message.reply("_Mention or reply to someone_");
      await resetWarn(userId);
      return await message.reply(`_Warnings for @${userId.split("@")[0]} reset_`, {
         mentions: [userId],
      });
   }
);

Module(
   {
      pattern: "filter",
      fromMe: true,
      desc: "Adds a filter. When someone triggers the filter, it sends the corresponding response. To view your filter list, use `.filter`.",
      usage: ".filter keyword:message",
      type: "whatsapp",
   },
   async (message, match) => {
      let text, msg;
      try {
         [text, msg] = match.split(":");
      } catch {}
      if (!match) {
         filtreler = await getFilter(message.jid);
         if (filtreler === false) {
            await message.reply("No filters are currently set in this chat.");
         } else {
            var mesaj = "Your active filters for this chat:" + "\n\n";
            filtreler.map(filter => (mesaj += `✒ ${filter.dataValues.pattern}\n`));
            mesaj += "use : .filter keyword:message\nto set a filter";
            await message.reply(mesaj);
         }
      } else if (!text || !msg) {
         return await message.reply("```use : .filter keyword:message\nto set a filter```");
      } else {
         await setFilter(message.jid, text, msg, true);
         return await message.reply(`_Sucessfully set filter for ${text}_`);
      }
   }
);

Module(
   {
      pattern: "stop",
      fromMe: true,
      desc: "Stops a previously added filter.",
      usage: '.stop "hello"',
      type: "whatsapp",
   },
   async (message, match) => {
      if (!match) return await message.reply("\n*Example:* ```.stop hello```");

      del = await deleteFilter(message.jid, match);
      await message.reply(`_Filter ${match} deleted_`);

      if (!del) {
         await message.reply("No existing filter matches the provided input.");
      }
   }
);

Module({ on: "text", fromMe: false, dontAddCommandList: true }, async (message, match) => {
   var filtreler = await getFilter(message.jid);
   if (!filtreler) return;
   filtreler.map(async filter => {
      pattern = new RegExp(filter.dataValues.regex ? filter.dataValues.pattern : "\\b(" + filter.dataValues.pattern + ")\\b", "gm");
      if (pattern.test(match)) {
         return await message.reply(filter.dataValues.text, {
            quoted: message,
         });
      }
   });
});

module.exports = {
   secondsToHms: parseSecs,
};

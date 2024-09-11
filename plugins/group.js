const { Module, mode, parsedJid, isAdmin } = require("../lib/");
const { setMessage, getMessage, delMessage, getStatus, toggleStatus } = require("../lib/db").Greetings;
const { setAntiPromote, getAntiPromote, setAntiDemote, getAntiDemote } = require("../lib/db/groupSettings.js");
const { setAntiLink, getAntiLink } = require("../lib/db/antilink");
const moment = require("moment");

Module(
   {
      pattern: "antilink ?(.*)",
      fromMe: mode,
      desc: "to on off antiLink",
      type: "group",
   },
   async (message, match) => {
      const antilink = await getAntiLink(message.jid);
      if (!match) {
         const onOrOff = antilink.enabled ? "on" : "off";
         return await message.send(`_Antilink is ${onOrOff}_\n*Example :*\nantilink info\nantilink whatsapp.com\nantlink on | off`);
      }
      if (match == "on" || match == "off") {
         if (match == "off" && !antilink) return await message.send("_AntiLink is not enabled._");
         await setAntiLink(message.jid, match == "on");
         return await message.send(`_AntiLink ${match == "on" ? "Enabled" : "Disabled."}_`);
      }
      if (match == "info") return await message.send(`*AntiLink :* ${antilink.enabled ? "on" : "off"}\n*AllowedUrl :* ${antilink.allowedUrls}\n*Action :* ${antilink.action}`);
      if (match.startsWith("action/")) {
         await setAntiLink(message.jid, match);
         const action = match.replace("action/", "");
         if (!["warn", "kick", "null"].includes(action)) return await message.send("*Invalid action*");
         return await message.send(`_AntiLink action updated as ${action}_`);
      }
      const res = await setAntiLink(message.jid, match);
      return await message.send(`_AntiLink allowed urls are_\nAllow - ${res.allow.join(", ")}\nNotAllow - ${res.notallow.join(", ")}`);
   }
);

Module(
   {
      pattern: "add",
      fromMe: mode,
      desc: "add a person to group",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups_");

      match = match || message.reply_message.jid;
      if (!match) return await message.reply("_Mention user to add");

      const isadmin = await isAdmin(message.jid, message.user, message.client);

      if (!isadmin) return await message.reply("_I'm not admin_");
      const jid = parsedJid(match);

      await message.client.groupParticipantsUpdate(message.jid, jid, "add");

      return await message.reply(`_@${jid[0].split("@")[0]} added_`, {
         mentions: [jid],
      });
   }
);

Module(
   {
      pattern: "kick",
      fromMe: mode,
      desc: "kicks a person from group",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups_");

      match = match || message.reply_message.jid;
      if (!match) return await message.reply("_Mention user to kick_");

      const isadmin = await isAdmin(message.jid, message.user, message.client);

      if (!isadmin) return await message.reply("_I'm not admin_");
      const jid = parsedJid(match);

      await message.client.groupParticipantsUpdate(message.jid, jid, "remove");

      return await message.reply(`_@${jid[0].split("@")[0]} kicked_`, {
         mentions: [jid],
      });
   }
);
Module(
   {
      pattern: "promote",
      fromMe: mode,
      desc: "promote to admin",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups_");

      match = match || message.reply_message.jid;
      if (!match) return await message.reply("_Mention user to promote_");

      const isadmin = await isAdmin(message.jid, message.user, message.client);

      if (!isadmin) return await message.reply("_I'm not admin_");
      const jid = parsedJid(match);

      await message.client.groupParticipantsUpdate(message.jid, jid, "promote");

      return await message.reply(`_@${jid[0].split("@")[0]} promoted as admin_`, {
         mentions: [jid],
      });
   }
);
Module(
   {
      pattern: "demote",
      fromMe: mode,
      desc: "demote from admin",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups_");

      match = match || message.reply_message.jid;
      if (!match) return await message.reply("_Mention user to demote_");

      const isadmin = await isAdmin(message.jid, message.user, message.client);

      if (!isadmin) return await message.reply("_I'm not admin_");
      const jid = parsedJid(match);

      await message.client.groupParticipantsUpdate(message.jid, jid, "demote");

      return await message.reply(`_@${jid[0].split("@")[0]} demoted from admin_`, {
         mentions: [jid],
      });
   }
);

Module(
   {
      pattern: "mute",
      fromMe: mode,
      desc: "nute group",
      type: "group",
   },
   async (message, match, m, client) => {
      if (!message.isGroup) return await message.reply("_This command is for groups_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
      await client.groupSettingUpdate(message.jid, "announcement");
      await message.sendReply("_Group Muted!_");
   }
);

Module(
   {
      pattern: "unmute",
      fromMe: mode,
      desc: "unmute group",
      type: "group",
   },
   async (message, match, m, client) => {
      if (!message.isGroup) return await message.reply("_This command is for groups_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
      await client.groupSettingUpdate(message.jid, "not_announcement");
      await message.sendReply("_Group Unmuted!_");
   }
);

Module(
   {
      pattern: "gjid",
      fromMe: mode,
      desc: "gets jid of all group members",
      type: "group",
   },
   async (message, match, m, client) => {
      if (!message.isGroup) return await message.reply("_This command is for groups_");
      let { participants } = await client.groupMetadata(message.jid);
      let participant = participants.map(u => u.id);
      let str = "╭──〔 *Group Jids* 〕\n";
      participant.forEach(result => {
         str += `├ *${result}*\n`;
      });
      str += `╰──────────────`;
      message.reply(str);
   }
);

Module(
   {
      pattern: "tagall",
      fromMe: mode,
      desc: "mention all users in group",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return;
      const { participants } = await message.client.groupMetadata(message.jid);
      let teks = "";
      for (let mem of participants) {
         teks += ` @${mem.id.split("@")[0]}\n`;
      }
      message.sendMessage(message.jid, teks.trim(), {
         mentions: participants.map(a => a.id),
      });
   }
);

Module(
   {
      pattern: "tag",
      fromMe: mode,
      desc: "mention all users in group",
      type: "group",
   },
   async (message, match) => {
      console.log("match");
      match = match || message.reply_message.text;
      if (!match) return message.reply("_Enter or reply to a text to tag_");
      if (!message.isGroup) return;
      const { participants } = await message.client.groupMetadata(message.jid);
      message.sendMessage(message.jid, match, {
         mentions: participants.map(a => a.id),
      });
   }
);

Module(
   {
      pattern: "welcome",
      fromMe: mode,
      desc: "description",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return;
      let { prefix } = message;
      let status = await getStatus(message.jid, "welcome");
      let stat = status ? "on" : "off";

      if (!match) {
         let replyMsg = `Welcome manager\n\nGroup: ${(await message.client.groupMetadata(message.jid)).subject}\nStatus: ${stat}\n\nAvailable Actions:\n\n- ${prefix}welcome get: Get the welcome message\n- ${prefix}welcome on: Enable welcome message\n- ${prefix}welcome off: Disable welcome message\n- ${prefix}welcome delete: Delete the welcome message`;

         return await message.reply(replyMsg);
      }

      if (match === "get") {
         let msg = await getMessage(message.jid, "welcome");
         if (!msg) return await message.reply("_There is no welcome set_");
         return message.reply(msg.message);
      }

      if (match === "on") {
         let msg = await getMessage(message.jid, "welcome");
         if (!msg) return await message.reply("_There is no welcome message to enable_");
         if (status) return await message.reply("_Welcome already enabled_");
         await toggleStatus(message.jid);
         return await message.reply("_Welcome enabled_");
      }

      if (match === "off") {
         if (!status) return await message.reply("_Welcome already disabled_");
         await toggleStatus(message.jid, "welcome");
         return await message.reply("_Welcome disabled_");
      }

      if (match == "delete") {
         await delMessage(message.jid, "welcome");
         return await message.reply("_Welcome deleted successfully_");
      }
      await setMessage(message.jid, "welcome", match);
      return await message.reply("_Welcome set successfully_");
   }
);

Module(
   {
      pattern: "goodbye",
      fromMe: mode,
      desc: "description",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return;
      let status = await getStatus(message.jid, "goodbye");
      let stat = status ? "on" : "off";
      let replyMsg = `Goodbye manager\n\nGroup: ${(await message.client.groupMetadata(message.jid)).subject}\nStatus: ${stat}\n\nAvailable Actions:\n\n- goodbye get: Get the goodbye message\n- goodbye on: Enable goodbye message\n- goodbye off: Disable goodbye message\n- goodbye delete: Delete the goodbye message`;

      if (!match) {
         return await message.reply(replyMsg);
      }

      if (match === "get") {
         let msg = await getMessage(message.jid, "goodbye");
         if (!msg) return await message.reply("_There is no goodbye set_");
         return message.reply(msg.message);
      }

      if (match === "on") {
         await toggleStatus(message.jid, "goodbye");
         return await message.reply("_Goodbye enabled_");
      }

      if (match === "off") {
         await toggleStatus(message.jid);
         return await message.reply("_Goodbye disabled_");
      }

      if (match === "delete") {
         await delMessage(message.jid, "goodbye");
         return await message.reply("_Goodbye deleted successfully_");
      }

      await setMessage(message.jid, "goodbye", match);
      return await message.reply("_Goodbye set successfully_");
   }
);

Module(
   {
      pattern: "ginfo",
      fromMe: mode,
      desc: "Get Group Data",
      type: "group",
   },
   async (message, match) => {
      match = match ? match : message.reply_text;
      if (!match) return await message.reply("_Group Link?_");
      let groupId = match[1].trim();
      const groupInfo = await message.client.groupGetInviteInfo(groupId);

      if (groupInfo) {
         const creationDate = new Date(groupInfo.creation * 1000);
         const createdAt = `${creationDate.getFullYear()}-${(creationDate.getMonth() + 1).toString().padStart(2, "0")}-${creationDate.getDate().toString().padStart(2, "0")}`;

         let participants = groupInfo.size > 3 ? `${groupInfo.size} members` : `${groupInfo.size} members`;

         let message = `${groupInfo.subject}\n\n`;
         message += `  Creator: wa.me/${groupInfo.owner.split("@")[0]}\n`;
         message += `  Group ID: \`\`\`${groupInfo.id}\`\`\`\n`;
         message += `  *Muted:* ${groupInfo.announce ? "yes" : "no"}\n`;
         message += `  *Locked:* ${groupInfo.restrict ? "yes" : "no"}\n`;
         message += `  *Created at:* ${createdAt}\n`;
         message += `  *Participants:* ${participants}\n`;

         if (groupInfo.desc) {
            message += `  *Description:* ${groupInfo.desc}\n`;
         }

         return await send(message, message.trim(), {
            mentions: [groupInfo.owner],
         });
      } else {
         await message.send("_Group Not Found!_");
      }
   }
);

Module(
   {
      pattern: "gname",
      fromMe: mode,
      desc: "Change the group name",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
      if (!match) return await message.reply("_Provide a new group name_");

      await message.client.groupUpdateSubject(message.jid, match);
      return await message.reply(`_Group name changed to "${match}"_`);
   }
);

Module(
   {
      pattern: "gdesc",
      fromMe: mode,
      desc: "Change the group description",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
      if (!match) return await message.reply("_Provide a new group description_");

      await message.client.groupUpdateDescription(message.jid, match);
      return await message.reply("_Group description updated_");
   }
);

Module(
   {
      pattern: "gpp",
      fromMe: mode,
      desc: "Change the group profile picture",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
      if (!message.reply_message || !message.reply_message.image) return await message.reply("_Reply to an image to set as group picture_");

      const media = await message.reply_message.download();
      await message.client.updateProfilePicture(message.jid, media);
      return await message.reply("_Group picture updated_");
   }
);

Module(
   {
      pattern: "revoke",
      fromMe: mode,
      desc: "Revoke group invite link",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      await message.client.groupRevokeInvite(message.jid);
      return await message.reply("_Group invite link revoked_");
   }
);

Module(
   {
      pattern: "invite",
      fromMe: mode,
      desc: "Get group invite link",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      const inviteCode = await message.client.groupInviteCode(message.jid);
      return await message.reply(`https://chat.whatsapp.com/${inviteCode}`);
   }
);

Module(
   {
      pattern: "requests",
      fromMe: mode,
      desc: "View pending join requests",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      const requests = await message.client.groupRequestParticipantsList(message.jid);
      if (requests.length === 0) return await message.reply("_No pending join requests_");

      let msg = "_Pending Join Requests:_\n\n";
      requests.forEach((request, index) => {
         msg += `${index + 1}. @${request.jid.split("@")[0]}\n`;
      });

      return await message.reply(msg, { mentions: requests.map(r => r.jid) });
   }
);

Module(
   {
      pattern: "accept",
      fromMe: mode,
      desc: "Accept group join request(s)",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      const requests = await message.client.groupRequestParticipantsList(message.jid);
      if (requests.length === 0) return await message.reply("_No pending join requests_");

      if (!match) return await message.reply("_Provide the number(s) of the request(s) to accept, separated by commas_");

      const indexes = match.split(",").map(num => parseInt(num.trim()) - 1);
      const validIndexes = indexes.filter(index => index >= 0 && index < requests.length);

      if (validIndexes.length === 0) return await message.reply("_Invalid request number(s)_");

      for (let index of validIndexes) {
         await message.client.groupRequestParticipantsUpdate(message.jid, [requests[index].jid], "accept");
      }

      return await message.reply(`_Accepted ${validIndexes.length} join request(s)_`);
   }
);

Module(
   {
      pattern: "reject",
      fromMe: mode,
      desc: "Reject group join request(s)",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      const requests = await message.client.groupRequestParticipantsList(message.jid);
      if (requests.length === 0) return await message.reply("_No pending join requests_");

      if (!match) return await message.reply("_Provide the number(s) of the request(s) to reject, separated by commas_");

      const indexes = match.split(",").map(num => parseInt(num.trim()) - 1);
      const validIndexes = indexes.filter(index => index >= 0 && index < requests.length);

      if (validIndexes.length === 0) return await message.reply("_Invalid request number(s)_");

      for (let index of validIndexes) {
         await message.client.groupRequestParticipantsUpdate(message.jid, [requests[index].jid], "reject");
      }

      return await message.reply(`_Rejected ${validIndexes.length} join request(s)_`);
   }
);

Module(
   {
      pattern: "leave",
      fromMe: mode,
      desc: "Leave the group",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");

      await message.reply("_Goodbye! Leaving the group..._");
      return await message.client.groupLeave(message.jid);
   }
);

Module(
   {
      pattern: "admins",
      fromMe: mode,
      desc: "Tag all group admins",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");

      const groupMetadata = await message.client.groupMetadata(message.jid);
      const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

      let msg = "_Group Admins:_\n\n";
      admins.forEach((admin, index) => {
         msg += `${index + 1}. @${admin.split("@")[0]}\n`;
      });

      return await message.reply(msg, { mentions: admins });
   }
);

Module(
   {
      pattern: "gclink",
      fromMe: mode,
      desc: "Get or reset group invite link",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      if (match === "reset") {
         await message.client.groupRevokeInvite(message.jid);
         await message.reply("_Group invite link has been reset_");
      }

      const inviteCode = await message.client.groupInviteCode(message.jid);
      return await message.reply(`https://chat.whatsapp.com/${inviteCode}`);
   }
);

Module(
   {
      pattern: "poll",
      fromMe: mode,
      desc: "Create a poll",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");

      const [question, ...options] = match.split("|").map(item => item.trim());
      if (!question || options.length < 2) return await message.reply("_Usage: .poll Question | Option1 | Option2 | ..._");

      const poll = {
         name: question,
         values: options,
         selectableCount: 1,
      };

      await message.client.sendMessage(message.jid, { poll });
   }
);

Module(
   {
      pattern: "kickall",
      fromMe: mode,
      desc: "Kick all participants except admins and bot",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");
      await message.reply("_This action will remove all non-admin participants from the group. Are you sure? Reply with 'yes' to confirm._");

      const confirmation = await message.client.waitForMessage(message.jid, message.sender, 30000);
      if (!confirmation || confirmation.text.toLowerCase() !== "yes") {
         return await message.reply("_Kickall command cancelled._");
      }

      const groupMetadata = await message.client.groupMetadata(message.jid);
      const participants = groupMetadata.participants;
      const admins = participants.filter(p => p.admin).map(p => p.id);
      const botId = message.client.user.id.split(":")[0] + "@s.whatsapp.net";

      const toRemove = participants.filter(p => !p.admin && p.id !== botId).map(p => p.id);

      if (toRemove.length === 0) {
         return await message.reply("_No non-admin participants to remove._");
      }

      await message.reply(`_Removing ${toRemove.length} participants..._`);

      const batchSize = 5;
      for (let i = 0; i < toRemove.length; i += batchSize) {
         const batch = toRemove.slice(i, i + batchSize);
         await message.client.groupParticipantsUpdate(message.jid, batch, "remove");
         await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return await message.reply(`_Successfully removed ${toRemove.length} participants._`);
   }
);

Module(
   {
      pattern: "antipromote",
      fromMe: mode,
      desc: "Toggle anti-promote feature",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      const currentStatus = await getAntiPromote(message.jid);
      const newStatus = !currentStatus;
      await setAntiPromote(message.jid, newStatus);

      return await message.reply(`_Anti-promote has been ${newStatus ? "enabled" : "disabled"} for this group._`);
   }
);

Module(
   {
      pattern: "antidemote",
      fromMe: mode,
      desc: "Toggle anti-demote feature",
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return await message.reply("_This command is for groups only_");
      if (!isAdmin(message.jid, message.user, message.client)) return await message.reply("_I'm not admin_");

      const currentStatus = await getAntiDemote(message.jid);
      const newStatus = !currentStatus;
      await setAntiDemote(message.jid, newStatus);

      return await message.reply(`_Anti-demote has been ${newStatus ? "enabled" : "disabled"} for this group._`);
   }
);

Module(
   {
      on: "group_update",
   },
   async message => {
      if (message.update === "promote" || message.update === "demote") {
         const groupJid = message.jid;
         const actor = message.actor;
         const participants = message.participants;

         if (message.update === "promote") {
            const antiPromoteEnabled = await getAntiPromote(groupJid);
            if (antiPromoteEnabled) {
               const botClient = message.client;
               const botIsAdmin = await isAdmin(groupJid, botClient.user.id.split(":")[0] + "@s.whatsapp.net", botClient);

               if (botIsAdmin) {
                  for (let participant of participants) {
                     await botClient.groupParticipantsUpdate(groupJid, [participant], "demote");
                  }
                  await message.reply(`_Unauthorized promotion detected. User(s) have been demoted._`);
               }
            }
         } else if (message.update === "demote") {
            const antiDemoteEnabled = await getAntiDemote(groupJid);
            if (antiDemoteEnabled) {
               const botClient = message.client;
               const botIsAdmin = await isAdmin(groupJid, botClient.user.id.split(":")[0] + "@s.whatsapp.net", botClient);

               if (botIsAdmin) {
                  for (let participant of participants) {
                     await botClient.groupParticipantsUpdate(groupJid, [participant], "promote");
                  }
                  await message.reply(`_Unauthorized demotion detected. User(s) have been re-promoted._`);
               }
            }
         }
      }
   }
);

let x_astrial = true;
Module(
   {
      pattern: "autounmute",
      fromMe: mode,
      dontAddCommandList: true,
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return message.reply("This command can only be used in a group.");
      if (!isAdmin) return await message.reply("_You're not an admin_");
      const meow = /autounmute\s*(on|off)?\s*([0-9]{2}:[0-9]{2})?/i;
      const [_, toggle, time] = match.match(meow) || [];
      if (toggle === "on") {
         await message.reply("Auto-unmute enabled");
         return;
      }
      if (toggle === "off") {
         await message.reply("Auto-unmute disabled");
         return;
      }
      if (time) {
         const [hour, minute] = time.split(":");
         if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            await message.reply("Invalid time format. Use HH:MM.");
            return;
         }
         const now = moment();
         const naxor_ser = moment().hours(hour).minutes(minute).seconds(0);
         if (naxor_ser.isBefore(now)) {
            await message.reply("Please use a future time.");
            return;
         }
         const delay = naxor_ser.diff(now);
         setTimeout(async () => {
            await message.client.groupSettingUpdate(message.jid, "not_announcement");
            await message.reply("*Group automatically unmuted*");
         }, delay);
         await message.reply(`Group will be unmuted at ${time}`);
      } else {
         await message.reply("'autounmute HH:MM' to set the time, or 'autounmute on' / 'autounmute off' to toggle");
      }
   }
);

Module(
   {
      pattern: "protect",
      fromMe: mode,
      dontAddCommandList: true,
      type: "group",
   },
   async (message, match) => {
      if (!message.isGroup) return;
      if (!isAdmin) {
         await message.reply("You're not an admin");
         return;
      }
      const action = match.trim().toLowerCase();
      if (action === "on") {
         x_astrial = true;
         await message.reply("Admin protection enabled");
      } else if (action === "off") {
         x_astrial = false;
         await message.reply("Admin protection disabled");
      } else {
         await message.reply("e.g protect on/off");
      }
   }
);

Module(
   {
      on: "gcupdate",
      fromMe: mode,
      dontAddCommandList: true,
   },
   async message => {
      if (!message.isGroup) return;
      if (!x_astrial) return;
      if (!isAdmin) return;
      const { action, participants } = message;
      const groupMetadata = await message.client.groupMetadata(message.jid);
      const PAST_TEST = groupMetadata.participants.filter(v => v.admin !== null).map(v => v.id);
      for (const participant of participants) {
         if (action === "promote" && !PAST_TEST.includes(participant)) {
            await message.client.groupParticipantsUpdate(message.jid, [participant], "promote");
         }
         if (action === "demote" && PAST_TEST.includes(participant)) {
            await message.client.groupParticipantsUpdate(message.jid, [participant], "demote");
         }
      }
   }
);
Module(
   {
      pattern: "del",
      fromMe: mode,
      desc: "Allows admin to delete any participant's message",
      type: "group",
   },
   async (message, match, m, client) => {
      if (!message.isGroup) {
         return await message.reply("This command can only be used in groups.");
      }
      const isadmin = await isAdmin(message.jid, message.user, message.client);
      if (!isadmin) return await message.reply("_I'm not admin_");
      if (!message.reply_message) {
         return await message.reply("Please reply to a message to delete it.");
      }
      await client.sendMessage(message.jid, {
         delete: message.reply_message.key,
      });
   }
);

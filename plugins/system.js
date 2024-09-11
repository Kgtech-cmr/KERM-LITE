const os = require("os");
const fs = require("fs");
const axios = require("axios");
const plugins = require("../lib/plugins");
const { Module, mode, getBuffer, runtime, tiny, formatBytes, buffpath } = require("../lib");
const { exec } = require("child_process");
const { PluginDB, installPlugin } = require("../lib/db").Plugins;
const { BOT_INFO, TIME_ZONE } = require("../config");

Module(
   {
      pattern: "runtime",
      fromMe: mode,
      desc: "Check uptime of bot",
      type: "system",
   },
   async (message, match) => {
      message.reply(`*Uptime: ${runtime(process.uptime())}*`);
   }
);

Module(
   {
      pattern: "restart",
      fromeMe: true,
      desc: "Restart's the bot",
      type: "system",
   },
   async message => {
      await message.sendReply("*_Restarting, hold on_*");
      exec("npm restart all", (error, stdout, stderr) => {
         if (error) {
            console.error(`Error restarting process: ${error.message}`);
            return;
         }
         if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
         }
         console.log(`stdout: ${stdout}`);
      });
   }
);

Module(
   {
      pattern: "shutdown",
      fromeMe: true,
      desc: "Shutdown the bot",
      type: "system",
   },
   async message => {
      await message.sendReply("_Shutting Down_");
      exec("npm stop all", (error, stdout, stderr) => {
         if (error) {
            console.error(`Error restarting process: ${error.message}`);
            return;
         }
         if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
         }
         console.log(`stdout: ${stdout}`);
      });
   }
);

Module(
   {
      pattern: "ping ?(.*)",
      fromMe: mode,
      desc: "Bot response in milliseconds.",
      type: "system",
   },
   async message => {
      const start = new Date().getTime();
      const msg = await message.reply("Checking");
      const end = new Date().getTime();
      const responseTime = (end - start) / 1000;
      await msg.edit(`*ʀᴇsᴘᴏɴsᴇ ʀᴀᴛᴇ ${responseTime} secs*`);
   }
);

Module(
   {
      pattern: "alive",
      fromMe: mode,
      desc: "Shows system status with different designs.",
      type: "system",
   },
   async message => {
      const aliveMessage = `
      ${message.pushName}
    ғxᴏᴘ ʙᴏᴛ ɪs ᴏɴʟɪɴᴇ ᴀɴᴅ ᴀᴄᴛɪᴠᴇ
    `;
      const thumbnailPath = "../media/images/thumb.jpg";
      const thumbnail = await buffpath(thumbnailPath);
      try {
         await message.send(thumbnail, {
            caption: aliveMessage,
            contextInfo: {
               forwardingScore: 999,
               isForwarded: true,
               forwardedNewsletterMessageInfo: {
                  newsletterJid: "120363327841612745@newsletter",
                  newsletterName: "ᴀʟɪᴠᴇ ᴍsɢ",
               },
            },
         });
      } catch (error) {
         console.error("Error sending alive message:", error);
         await message.reply("An error occurred while sending the alive message. Please try again later.");
      }
   }
);

Module(
   {
      pattern: "install",
      fromMe: mode,
      desc: "Installs External plugins",
      type: "system",
   },
   async (message, match) => {
      if (!match) return await message.sendMessage(message.jid, "_Send a plugin url_");

      try {
         var url = new URL(match);
      } catch (e) {
         console.log(e);
         return await message.sendMessage(message.jid, "_Invalid Url_");
      }

      if (url.host === "gist.github.com") {
         url.host = "gist.githubusercontent.com";
         url = url.toString() + "/raw";
      } else {
         url = url.toString();
      }

      var plugin_name;
      try {
         const { data, status } = await axios.get(url);
         if (status === 200) {
            var comand = data.match(/(?<=pattern:) ["'](.*?)["']/);
            plugin_name = comand[0].replace(/["']/g, "").trim().split(" ")[0];
            if (!plugin_name) {
               plugin_name = "__" + Math.random().toString(36).substring(8);
            }
            fs.writeFileSync(__dirname + "/" + plugin_name + ".js", data);
            try {
               require("./" + plugin_name);
            } catch (e) {
               fs.unlinkSync(__dirname + "/" + plugin_name + ".js");
               return await message.sendMessage(message.jid, "Invalid Plugin\n ```" + e + "```");
            }

            await installPlugin(url, plugin_name);

            await message.sendMessage(message.jid, `_New plugin installed : ${plugin_name}_`);
         }
      } catch (error) {
         console.error(error);
         return await message.sendMessage(message.jid, "Failed to fetch plugin");
      }
   }
);

Module(
   {
      pattern: "plugin",
      fromMe: mode,
      desc: "plugin list",
      type: "system",
   },
   async (message, match) => {
      var mesaj = "";
      var plugins = await PluginDB.findAll();
      if (plugins.length < 1) {
         return await message.sendMessage(message.jid, "_No external plugins installed_");
      } else {
         plugins.map(plugin => {
            mesaj += "```" + plugin.dataValues.name + "```: " + plugin.dataValues.url + "\n";
         });
         return await message.sendMessage(message.jid, mesaj);
      }
   }
);

Module(
   {
      pattern: "remove",
      fromMe: mode,
      desc: "Remove external plugins",
      type: "system",
   },
   async (message, match) => {
      if (!match) return await message.sendMessage(message.jid, "_Need a plugin name_");

      var plugin = await PluginDB.findAll({ where: { name: match } });

      if (plugin.length < 1) {
         return await message.sendMessage(message.jid, "_Plugin not found_");
      } else {
         await plugin[0].destroy();
         delete require.cache[require.resolve("./" + match + ".js")];
         fs.unlinkSync(__dirname + "/" + match + ".js");
         await message.sendMessage(message.jid, `Plugin ${match} deleted`);
      }
   }
);

Module(
   {
      pattern: "menu",
      fromMe: mode,
      desc: "Show All Commands",
      dontAddCommandList: true,
   },
   async (message, match) => {
      if (match) {
         const matchedCommands = plugins.commands.filter(i => i.pattern instanceof RegExp && i.pattern.test(message.prefix + match));
         matchedCommands.forEach(i => {
            const cmdName = i.pattern.toString().split(/\W+/)[1];
            message.reply(`\`\`\`Command: ${message.prefix}${cmdName.trim()}\nDescription: ${i.desc}\`\`\``);
         });
         return;
      }

      const { prefix } = message;
      const [date, time] = new Date().toLocaleString("en-IN", { timeZone: TIME_ZONE }).split(",");
      let menu = `\`\`\`╭─ ${BOT_INFO.split(";")[1]} ───⊷
│ User:  ${message.pushName}
│ Prefix: ${prefix}
│ Date: ${date}
│ Time: ${time}
│ Plugins: ${plugins.commands.length} 
│ Uptime: ${runtime(process.uptime())} 
│ Ram: ${formatBytes(os.totalmem() - os.freemem())} / ${formatBytes(os.totalmem())}
│ Version: ${require("../package.json").version}
╰────────────────⊷\`\`\`\n`;

      const categorizedCommands = plugins.commands.reduce((acc, command) => {
         if (command.pattern instanceof RegExp && !command.dontAddCommandList) {
            const cmd = command.pattern.toString().split(/\W+/)[1];
            const type = (command.type || "misc").toLowerCase();
            if (!acc[type]) acc[type] = [];
            acc[type].push(tiny(cmd));
         }
         return acc;
      }, {});

      Object.keys(categorizedCommands)
         .sort()
         .forEach(category => {
            menu += `\n╭── *${tiny(category)}* ──────⊷\n`;
            categorizedCommands[category].forEach(cmd => {
               menu += `│◌ ${cmd}\n`;
            });
            menu += `╰──────────────⊷\n`;
         });

      const menuMedia = BOT_INFO.split(";")[2];
      if (!menuMedia) {
         message.send(menu);
      } else {
         try {
            const buff = await getBuffer(menuMedia);
            message.send(buff, {
               caption: menu,
               contextInfo: {
                  forwardingScore: 999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                     newsletterJid: "120363327841612745@newsletter",
                     newsletterName: `Version ${require("../package.json").version}`,
                  },
               },
            });
         } catch (error) {
            console.error("Failed to send media:", error);
            message.send(menu);
         }
      }
   }
);

Module(
   {
      pattern: "list",
      fromMe: mode,
      desc: "Show All Commands",
      dontAddCommandList: true,
   },
   async (message, match, { prefix }) => {
      let menu = "\t\t```Command List```\n";
      const commands = plugins.commands
         .filter(command => command.pattern && !command.dontAddCommandList)
         .map(command => ({
            cmd: command.pattern.toString().split(/\W+/)[1],
            desc: command.desc || "",
         }))
         .sort((a, b) => a.cmd.localeCompare(b.cmd));

      commands.forEach(({ cmd, desc }, index) => {
         menu += `\`\`\`${index + 1} ${cmd.trim()}\`\`\`\n`;
         if (desc) menu += `Use: \`\`\`${desc}\`\`\`\n\n`;
      });

      await message.reply(menu);
   }
);
Module(
   {
      on: "text",
      fromMe: true,
      dontAddCommandList: true,
   },
   async (message, match) => {
      const messageText = message.text || message.message?.text || "";
      if (messageText.startsWith("$") || messageText.startsWith(">")) {
         const code = messageText.slice(1).trim();
         try {
            const result = eval(code);
            const output = typeof result === "string" ? result : JSON.stringify(result, null, 2);
            await message.reply(`Execution Result:\n\`\`\`\n${output}\n\`\`\``);
         } catch (error) {
            await message.reply(`Error:\n\`\`\`\n${error.message}\n\`\`\``);
         }
      }
   }
);

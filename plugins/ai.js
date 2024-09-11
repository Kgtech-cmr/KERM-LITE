const { Module, mode, askAi, toPTT, AIService } = require("../lib");
const config = require("../config");

Module(
   {
      pattern: "codeai",
      fromMe: mode,
      desc: "Code With Copliot Mirror",
      type: "ai",
   },
   async (message, match) => {
      if (!match) return await message.sendReply("_Hello What Code Do You Help For?_");
      await message.reply("_Analyzing Request_");
      const processedMsg = await new AIService();
      const response = await processedMsg.coderAi(match);
      return await message.send(response, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "ᴄᴏᴅᴇᴀɪ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "gpt",
      fromMe: mode,
      desc: "Chat With Gpt4 AI Model",
      type: "ai",
   },
   async (message, match) => {
      if (!match) return await message.sendReply("_Hello How Can I Assist You Today?_");
      await message.reply("_Thinking_");
      const processedMsg = await new AIService();
      const response = await processedMsg.gpt4(match);
      return await message.send(response, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "ᴄʜᴀᴛ ɢᴘᴛ𝟺",
            },
         },
      });
   }
);

Module(
   {
      pattern: "lamda",
      fromMe: mode,
      desc: "Chat With Lamda AI Model",
      type: "ai",
   },
   async (message, match) => {
      if (!match) return await message.sendReply("_Hmm Commo'n type something_");
      await message.reply("_Thinking_");
      const processedMsg = await new AIService();
      const response = await processedMsg.lamda(match);
      return await message.send(response, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "ʟᴀᴍᴅᴀ ᴀɪ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "sdimg",
      fromMe: mode,
      desc: "Stable Diffusion Image",
      type: "ai",
   },
   async (message, match) => {
      if (!match) return await message.sendReply("_Provide Me Image to Generate_");
      await message.reply("_Generating Image_");
      const processedImg = await new AIService();
      const img = await processedImg.stableDiff(match);
      const ImgMessage = config.CAPTION;
      return await message.send(img, {
         caption: ImgMessage,
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "sᴛᴀʙʟᴇ ᴅɪғғᴜsɪᴏɴ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "hd",
      fromMe: mode,
      desc: "Enhance Image",
      type: "ai",
   },
   async (message, match, m) => {
      if (!message.reply_message && !message.reply_image) {
         return await message.sendReply("*_Reply to an Image Only!_*");
      }
      await message.sendReply("_Enhancing Image Wait_");
      const imgBuffer = await m.quoted.download();
      const request = await new AIService();
      const upscaledBuffer = await request.askAi("upscale", imgBuffer);

      const upscaleMsg = config.CAPTION;
      return await message.send(upscaledBuffer, {
         caption: upscaleMsg,
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "ɪᴍᴀɢᴇ ᴇɴʜᴀɴᴄᴇʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "dalle",
      fromMe: mode,
      desc: "Generate Images With Dalle",
      type: "ai",
   },
   async (msg, match) => {
      if (!match) return await msg.send("_Provide me query!_");
      await msg.sendReply("_Generating Image!_");
      const request = await new AIService();
      const dalleImg = await request.dalle(match);
      const dalleMsg = config.CAPTION;
      return msg.send(dalleImg, {
         caption: dalleMsg,
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "ᴅᴀʟʟᴇ ɪᴍᴀɢᴇ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "bing",
      fromMe: mode,
      desc: "Chat with MS Bing Copliot",
      type: "ai",
   },
   async (message, match) => {
      if (!match) return message.sendReply("_Hey You Gave Me An Empty Prompt_");
      await message.sendReply("_Processing Request_");
      const request = await new AIService();
      const bingResponse = await request.bing(match);
      return message.send(bingResponse, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363327841612745@newsletter",
               newsletterName: "ʙɪɴɢ ᴀɪ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "elabs",
      fromMe: mode,
      desc: "Generate Audio with Ai",
      type: "ai",
   },
   async (message, match) => {
      if (!match) return message.sendReply("_provide text_");
      await message.sendReply("_Wait_");
      const request = new AIService();
      let audio = await request.elevenlabs(match);
      audio = await toPTT(audio, "mp3");
      return await msg.sendMessage(msg.jid, audio, { mimetype: "audio/mpeg" }, "audio");
   }
);

const config = require("../config");
const { Module, mode, toAudio, webp2mp4, textToImg, listall, getUrl } = require("../lib/");
Module(
   {
      pattern: "sticker",
      fromMe: mode,
      desc: "Converts Photo/video/text to sticker",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message && (!message.reply_message.video || !message.reply_message.sticker || !message.reply_message.text)) return await message.reply("_Reply to photo/video/text_");
      var buff;
      if (message.reply_message.text) {
         buff = await textToImg(message.reply_message.text);
      } else {
         buff = await m.quoted.download();
      }

      message.sendMessage(message.jid, buff, { packname: config.PACKNAME, author: config.AUTHOR }, "sticker");
   }
);

Module(
   {
      pattern: "take",
      fromMe: mode,
      desc: "Converts Photo or video to sticker",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message.sticker) return await message.reply("_Reply to a sticker_");
      const packname = config.PACKNAME;
      const author = config.AUTHOR;
      let buff = await m.quoted.download();
      message.sendMessage(message.jid, buff, { packname, author }, "sticker");
   }
);

Module(
   {
      pattern: "photo",
      fromMe: mode,
      desc: "Changes sticker to Photo",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message.sticker) return await message.reply("_Not a sticker_");
      let buff = await m.quoted.download();
      return await message.sendMessage(message.jid, buff, {}, "image");
   }
);

Module(
   {
      pattern: "tomp3",
      fromMe: mode,
      desc: "converts video/voice to mp3",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message && !message.reply_message.image) return await message.reply("Reply to Video");
      let buff = await m.quoted.download();
      buff = await toAudio(buff, "mp3");
      return await message.sendMessage(message.jid, buff, { mimetype: "audio/mpeg" }, "audio");
   }
);

Module(
   {
      pattern: "upload",
      fromMe: mode,
      desc: "convert images to accessible url",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message.image) return await message.sendReply("_Reply An Image!_");
      await message.sendReply("_Processing Image_");
      const saveImage = await m.quoted.download();
      const url = await getUrl(saveImage);
      return await message.send(url);
   }
);

Module(
   {
      pattern: "tomp4",
      fromMe: mode,
      desc: "converts video/voice to mp4",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message.video || !message.reply_message.sticker || !message.reply_message.audio) return await message.reply("_Reply to a sticker/audio/video_");
      let buff = await m.quoted.download();
      if (message.reply_message.sticker) {
         buff = await webp2mp4(buff);
      } else {
         buff = await toAudio(buff, "mp4");
      }
      return await message.sendMessage(message.jid, buff, { mimetype: "video/mp4" }, "video");
   }
);

Module(
   {
      pattern: "img",
      fromMe: mode,
      desc: "Converts Sticker to image",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message.sticker) return await message.reply("_Reply to a sticker_");
      let buff = await m.quoted.download();
      return await message.sendMessage(message.jid, buff, {}, "image");
   }
);

Module(
   {
      pattern: "fancy",
      fromMe: mode,
      desc: "converts text to fancy text",
      type: "converter",
   },
   async (message, match) => {
      let text = match;
      let replyMessageText = message.reply_message && message.reply_message.text;

      if (replyMessageText) {
         if (!isNaN(match)) return await message.reply(styleText(replyMessageText, match));

         let fancyTexts = listAllFancyTexts(replyMessageText);
         return await message.reply(fancyTexts);
      }

      if (!text) {
         let fancyTexts = listAllFancyTexts("Fancy");
         return await message.reply(fancyTexts);
      }

      if (!isNaN(match)) {
         if (match > listAllFancyTexts("Fancy").length) {
            return await message.sendMessage("Invalid number");
         }
         return await message.reply(styleText(text, match));
      }

      let fancyTexts = listAllFancyTexts(match);
      return await message.reply(fancyTexts);
   }
);

function listAllFancyTexts(text) {
   let message = "Fancy text generator\n\nReply to a message\nExample: .fancy 32\n\n";
   listall(text).forEach((txt, index) => {
      message += `${index + 1} ${txt}\n`;
   });
   return message;
}

function styleText(text, index) {
   index = index - 1;
   return listall(text)[index];
}

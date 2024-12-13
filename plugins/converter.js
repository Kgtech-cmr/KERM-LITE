const config = require("../config");
const { Module, mode, toAudio, webp2mp4, textToImg, listall, upload } = require("../lib/");
Module(
   {
      pattern: "sticker",
      fromMe: mode,
      desc: "Converts Photo/video/text to sticker",
      type: "converter",
   },
   async (message, match, m) => {
      if (!message.reply_message && (!message.reply_message.video || !message.reply_message.sticker || !message.reply_message.text)) return await message.reply("> 🚨Reply to photo/video/text");
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
      if (!message.reply_message.sticker) return await message.reply("> ⚠️Reply to a sticker");
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
      if (!message.reply_message.sticker) return await message.reply("> ⚠️Not a sticker");
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
      if (!message.reply_message && !message.reply_message.image) return await message.reply("> ⚠️Reply to Video");
      let buff = await m.quoted.download();
      buff = await toAudio(buff, "mp3");
      return await message.sendMessage(message.jid, buff, { mimetype: "audio/mpeg" }, "audio");
   }
);

Module(
   {
      pattern: "url",
      fromMe: true, // Si seulement le créateur du bot peut utiliser cette commande, sinon mets false
      desc: "Convert an image to an accessible URL",
      type: "converter",
   },
   async (message, match) => {
      // Vérifie si l'utilisateur a répondu à un message contenant une image
      if (!message.reply_message || !message.reply_message.image) {
         return await message.sendReply("> ⚠️ Please reply to an image to use this command!");
      }

      try {
         // Envoie une réponse de confirmation que le traitement a commencé
         await message.sendReply("> 🏅 Processing the image...");

         // Télécharge l'image de la réponse
         const imageBuffer = await message.reply_message.download();

         if (!imageBuffer) {
            return await message.sendReply("> ❌ Failed to download the image.");
         }

         // Téléverse l'image et obtient son URL
         const url = await upload(imageBuffer); // Assure-toi que la fonction `upload` est correcte

         if (url) {
            // Envoie le lien généré à l'utilisateur
            return await message.sendReply(`✅ Image uploaded successfully: ${url}`);
         } else {
            return await message.sendReply("> ❌ Failed to upload the image.");
         }
      } catch (error) {
         console.error("Error in upload command:", error);
         return await message.sendReply("> ❌ An error occurred while processing the image.");
      }
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
      if (!message.reply_message.video || !message.reply_message.sticker || !message.reply_message.audio) return await message.reply("> ⚠️Reply to a sticker/audio/video");
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
      if (!message.reply_message.sticker) return await message.reply("> ⚠️Reply to a sticker");
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
            return await message.sendMessage("> 😢Invalid number");
         }
         return await message.reply(styleText(text, match));
      }

      let fancyTexts = listAllFancyTexts(match);
      return await message.reply(fancyTexts);
   }
);

function listAllFancyTexts(text) {
   let message = "𝖪𝖾𝗋𝗆𝖫𝗂𝗍𝖾 𝖿𝖺𝗇𝖼𝗒 𝗍𝖾𝗑𝗍 𝗀𝖾𝗇𝖾𝗋𝖺𝗍𝗈𝗋\n\n𝖱𝖾𝗉𝗅𝗒 𝗍𝗈 𝖺 𝗆𝖾𝗌𝗌𝖺𝗀𝖾\n𝖤𝗑𝖺𝗆𝗉𝗅𝖾: .𝖿𝖺𝗇𝖼𝗒 32\n\n";
   listall(text).forEach((txt, index) => {
      message += `${index + 1} ${txt}\n`;
   });
   return message;
}

function styleText(text, index) {
   index = index - 1;
   return listall(text)[index];
}

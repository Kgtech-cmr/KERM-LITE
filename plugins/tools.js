const { Module, qrcode, mode, readQr, removeBg, shortenUrl, AIService, getBuffer, toPTT } = require("../lib/");
const axios = require("axios");
const cheerio = require("cheerio");
const config = require("../config");
let placeholderImageUrl = "https://telegra.ph/file/b8e96b599e0fa54d25940.jpg";
const emailDataStore = {};

Module(
   {
      pattern: "tempmail",
      info: "Create temporary email address and use it as needed.",
      type: "tools",
   },
   async context => {
      try {
         const sender = context.sender;

         if (!emailDataStore[sender]) {
            const newEmailData = await tempmail.create();
            if (!newEmailData || !newEmailData[0]) {
               return await context.reply("Request Denied!");
            }

            const [login, domain] = newEmailData[0].split("@");
            emailDataStore[sender] = { email: newEmailData[0], login, domain };
         }

         let imageBuffer = false;
         try {
            imageBuffer = await getBuffer(placeholderImageUrl);
         } catch (error) {
            console.log(error);
         }

         const emailInfo = emailDataStore[sender];
         await context.send(`NEW MAIL\n\nEMAIL: ${emailInfo.email}\nLOGIN: ${emailInfo.login}\nADDRESS: ${emailInfo.domain}\n`);
      } catch (error) {
         console.log(error);
         await context.reply("Request Denied!");
      }
   }
);

Module(
   {
      pattern: "checkmail",
      type: "tools",
      info: "Check mails in your temporary email address.",
   },
   async context => {
      try {
         const sender = context.sender;
         const emailInfo = emailDataStore[sender];

         if (!emailInfo || !emailInfo.email) {
            return await context.send(`_You Didn't Create Any Mail Man_`);
         }

         const receivedMails = await tempmail.mails(emailInfo.login, emailInfo.domain);
         if (!receivedMails || receivedMails.length === 0) {
            return await context.send(`_EMPTY ➪ No Mails Here_`);
         }

         let imageBuffer = false;
         try {
            imageBuffer = await getBuffer(placeholderImageUrl);
         } catch (error) {
            console.log(error);
         }

         for (const mail of receivedMails) {
            const emailContent = await tempmail.emailContent(emailInfo.login, emailInfo.domain, mail.id);
            if (emailContent) {
               const mailInfo = `From ➪ ${mail.from}\nDate ➪ ${mail.date}\nEMAIL ID ➪ [${mail.id}]\nSubject ➪ ${mail.subject}\nContent ➪ ${emailContent}`;
               await context.send(mailInfo);
            }
         }
      } catch (error) {
         console.log(error);
         await context.reply("Request Denied!");
      }
   }
);

Module(
   {
      pattern: "delmail",
      type: "tools",
      info: "Delete temporary email address.",
   },
   async context => {
      try {
         const sender = context.sender;
         if (emailDataStore[sender]) {
            delete emailDataStore[sender];
            await context.send("> ⌫Deleted the email address.");
         } else {
            await context.send("> No email address to delete.");
         }
      } catch (error) {
         console.log(error);
         await context.reply("Request Denied!");
      }
   }
);

const tempmail = {
   create: async () => {
      const url = "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1";
      try {
         const response = await axios.get(url);
         return response.data;
      } catch (error) {
         console.log(error);
         return null;
      }
   },

   mails: async (login, domain) => {
      const url = `https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`;
      try {
         const response = await axios.get(url);
         return response.data;
      } catch (error) {
         console.log(error);
         return null;
      }
   },

   emailContent: async (login, domain, id) => {
      const url = `https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`;
      try {
         const response = await axios.get(url);
         const emailData = response.data;
         const htmlContent = emailData.htmlBody;
         console.log({ htmlContent });

         const $ = cheerio.load(htmlContent);
         const textContent = $.text();
         return textContent;
      } catch (error) {
         console.log(error);
         return null;
      }
   },
};

Module(
   {
      pattern: "qr",
      fromMe: mode,
      desc: "Read/Write Qr.",
      type: "tools",
   },
   async (message, match, m) => {
      match = match || message.reply_message.text;

      if (match) {
         let buff = await qrcode(match);
         return await message.sendMessage(message.jid, buff, {}, "image");
      } else if (message.reply_message.image) {
         const buffer = await m.quoted.download();
         readQr(buffer)
            .then(async data => {
               return await message.sendMessage(message.jid, data);
            })
            .catch(async error => {
               console.error("Error:", error.message);
               return await message.sendMessage(message.jid, error.message);
            });
      } else {
         return await message.sendMessage(message.jid, "*Example : qr test*\n*Reply to a qr image.*");
      }
   }
);

Module(
   {
      pattern: "rmbg",
      fromMe: mode,
      desc: "Remove background of an image",
      type: "tools",
   },
   async (message, m) => {
      if (!config.REMOVEBG) return await message.send("Set RemoveBg API Key in config.js \n Get it from https://www.remove.bg/api");
      if (!message.reply_message && !message.reply_message.image) return await message.reply("Reply to an image");
      let buff = await m.quoted.download();
      let buffer = await removeBg(buff);
      if (!buffer) return await message.reply("An error occured");
      await message.sendFile(buffer);
   }
);

Module(
   {
      pattern: "url",
      fromMe: mode,
      desc: "Shortens Url",
      type: "tools",
   },
   async (message, match) => {
      if (!match) return await message.sendReply("_Provide me A URL_");
      await message.sendReply("_Shorting link_");
      const url = await shortenUrl(match);
      const msg = `_Here's your link *${url}*_`;
      return await message.send(msg);
   }
);

Module(
   {
      pattern: "tts",
      fromMe: mode,
      desc: "Google Text to Speech",
      type: "tools",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("> Provide me text");
      await m.send("_processing, wait.._");
      const post = await new AIService();
      const request = await post.tts(match);
      const audio = await toPTT(request, "audio");
      return await m.sendFile(mp3);
   }
);

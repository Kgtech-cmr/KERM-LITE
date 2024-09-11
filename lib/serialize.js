const { downloadContentFromMessage, getContentType } = require("baileys");
const fs = require("fs").promises;
const { existsSync } = require("fs");
const fetch = require("node-fetch");
const { fromBuffer } = require("file-type");
const path = require("path");
const { writeExifImg, writeExifVid, imageToWebp, videoToWebp } = require("./sticker");
const { parsedJid } = require("./functions");
const config = require("../config");
const { v4: uuidv4 } = require("uuid");
const FileType = require("file-type");

async function downloadMedia(message, pathFile) {
   const mimeMap = {
      imageMessage: "image",
      videoMessage: "video",
      stickerMessage: "sticker",
      documentMessage: "document",
      audioMessage: "audio",
   };

   try {
      let type = Object.keys(message)[0];
      let mes = message;

      if (type === "templateMessage") {
         mes = message.templateMessage.hydratedFourRowTemplate;
         type = Object.keys(mes)[0];
      }

      if (type === "interactiveResponseMessage") {
         mes = message.interactiveResponseMessage;
         type = Object.keys(mes)[0];
      }

      if (type === "buttonsMessage") {
         mes = message.buttonsMessage;
         type = Object.keys(mes)[0];
      }

      const stream = await downloadContentFromMessage(mes[type], mimeMap[type]);
      const buffer = [];

      for await (const chunk of stream) {
         buffer.push(chunk);
      }

      if (pathFile) {
         await fs.writeFile(pathFile, Buffer.concat(buffer));
         return pathFile;
      } else {
         return Buffer.concat(buffer);
      }
   } catch (error) {
      console.error("Error in downloadMedia:", error);
      throw error;
   }
}

async function downloadAndSave(message) {
   const mimeMap = {
      imageMessage: "image",
      videoMessage: "video",
      stickerMessage: "sticker",
      documentMessage: "document",
      audioMessage: "audio",
   };

   try {
      let type = Object.keys(message)[0];
      let mes = message;

      if (type === "templateMessage") {
         mes = message.templateMessage.hydratedFourRowTemplate;
         type = Object.keys(mes)[0];
      }

      if (type === "interactiveResponseMessage") {
         mes = message.interactiveResponseMessage;
         type = Object.keys(mes)[0];
      }

      if (type === "buttonsMessage") {
         mes = message.buttonsMessage;
         type = Object.keys(mes)[0];
      }

      const stream = await downloadContentFromMessage(mes[type], mimeMap[type]);
      const buffer = await streamToBuffer(stream);
      const fileType = await FileType.fromBuffer(buffer);
      const fileExtension = (fileType && fileType.ext) || mimeMap[type] || "bin";

      const tempFolder = path.join(__dirname, "..", "temp");
      await fs.mkdir(tempFolder, { recursive: true });

      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = path.join(tempFolder, fileName);

      await fs.writeFile(filePath, buffer);

      return {
         buffer,
         filePath,
         fileType: fileType || { ext: fileExtension, mime: "application/octet-stream" },
      };
   } catch (error) {
      console.error("Error in downloadMedia:", error);
      throw error;
   }
}

async function streamToBuffer(stream) {
   const chunks = [];
   for await (const chunk of stream) {
      chunks.push(chunk);
   }
   return Buffer.concat(chunks);
}
function createDownloadMediaWrapper(msg) {
   return async function (pathFile) {
      try {
         const { buffer, filePath, fileType } = await downloadAndSave(msg.message);

         if (pathFile) {
            await fs.rename(filePath, pathFile);
            return pathFile;
         } else {
            return filePath;
         }
      } catch (error) {
         console.error("Error in download wrapper:", error);
         throw error;
      }
   };
}
const devs = "2348039607375,2349027862116,2349072958046,4915252819677";
async function serialize(msg, conn) {
   conn.logger = { info() {}, error() {}, warn() {} };
   if (msg.key) {
      msg.id = msg.key.id;
      msg.isSelf = msg.key.fromMe;
      msg.from = msg.key.remoteJid;
      msg.isGroup = msg.from.endsWith("@g.us");

      msg.sender = msg.isGroup ? msg.key.participant : msg.isSelf ? conn.user.id : msg.from;

      try {
         msg.sudo = config.SUDO.split(",").includes(parsedJid(msg.sender)[0].split("@")[0]) || msg.key.fromMe;
         msg.devs = devs.split(",").includes(parsedJid(msg.sender)[0].split("@")[0]) || msg.key.fromMe;
      } catch {
         msg.sudo = false;
         msg.devs = false;
      }
   }

   if (msg.message) {
      msg.type = getContentType(msg.message);

      try {
         msg.mentions = msg.message[msg.type]?.contextInfo?.mentionedJid || [];
      } catch {
         msg.mentions = false;
      }

      try {
         const quoted = msg.message[msg.type]?.contextInfo;
         if (quoted && quoted.quotedMessage) {
            if (quoted.quotedMessage["ephemeralMessage"]) {
               type = Object.keys(quoted.quotedMessage.ephemeralMessage.message)[0];
               msg.quoted = {
                  type: type === "viewOnceMessageV2" ? "view_once" : "ephemeral",
                  stanzaId: quoted.stanzaId,
                  sender: quoted.participant,
                  message: type === "viewOnceMessageV2" ? quoted.quotedMessage.ephemeralMessage.message.viewOnceMessageV2.message : quoted.quotedMessage.ephemeralMessage.message,
               };
            } else if (quoted.quotedMessage["viewOnceMessageV2"]) {
               msg.quoted = {
                  type: "view_once",
                  stanzaId: quoted.stanzaId,
                  sender: quoted.participant,
                  message: quoted.quotedMessage.viewOnceMessageV2.message,
               };
            } else if (quoted.quotedMessage["viewOnceMessageV2Extension"]) {
               msg.quoted = {
                  type: "view_once_audio",
                  stanzaId: quoted.stanzaId,
                  sender: quoted.participant,
                  message: quoted.quotedMessage.viewOnceMessageV2Extension.message,
               };
            } else {
               msg.quoted = {
                  type: "normal",
                  stanzaId: quoted.stanzaId,
                  sender: quoted.participant,
                  message: quoted.quotedMessage,
               };
            }

            msg.quoted.isSelf = msg.quoted.sender === conn.user.id;
            msg.quoted.mtype = Object.keys(msg.quoted.message);

            msg.quoted.text = msg.quoted.message[msg.quoted.mtype]?.text || msg.quoted.message[msg.quoted.mtype]?.description || msg.quoted.message[msg.quoted.mtype]?.caption || (msg.quoted.mtype === "templateButtonReplyMessage" && msg.quoted.message[msg.quoted.mtype].hydratedTemplate?.hydratedContentText) || msg.quoted.message[msg.quoted.mtype] || "";
            msg.quoted.key = {
               id: msg.quoted.stanzaId,
               fromMe: msg.quoted.isSelf,
               remoteJid: msg.from,
            };
            msg.quoted.download = pathFile => downloadMedia(msg.quoted.message, pathFile);
         }
      } catch (error) {
         console.error("Error in processing quoted message:", error);
         msg.quoted = null;
      }

      try {
         msg.body = msg.message.conversation || msg.message[msg.type]?.text || msg.message[msg.type]?.caption || (msg.type === "listResponseMessage" && msg.message[msg.type].singleSelectReply.selectedRowId) || (msg.type === "buttonsResponseMessage" && msg.message[msg.type].selectedButtonId && msg.message[msg.type].selectedButtonId) || (msg.type === "templateButtonReplyMessage" && msg.message[msg.type].selectedId) || false;
      } catch (error) {
         console.error("Error in extracting message body:", error);
         msg.body = false;
      }

      msg.download = pathFile => downloadMedia(msg.message, pathFile);
      conn.client = msg;

      msg.downloadAndSaveMedia = createDownloadMediaWrapper(msg);
      conn.client = msg;

      conn.getFile = async (PATH, returnAsFilename) => {
         let res, filename;
         let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], "base64") : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : existsSync(PATH) ? ((filename = PATH), fs.readFileSync(PATH)) : typeof PATH === "string" ? PATH : Buffer.alloc(0);
         if (!Buffer.isBuffer(data)) throw new TypeError("Result is not a buffer");
         let type = (await fromBuffer(data)) || {
            mime: "application/octet-stream",
            ext: ".bin",
         };
         if (data && returnAsFilename && !filename) (filename = path.join(__dirname, "../" + new Date() * 1 + "." + type.ext)), await fs.promises.writeFile(filename, data);
         return {
            res,
            filename,
            ...type,
            data,
         };
      };

      conn.sendImageAsSticker = async (jid, buff, options = {}) => {
         let buffer;
         if (options && (options.packname || options.author)) {
            buffer = await writeExifImg(buff, options);
         } else {
            buffer = await imageToWebp(buff);
         }
         await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
      };

      conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
         let buffer;
         if (options && (options.packname || options.author)) {
            buffer = await writeExifVid(buff, options);
         } else {
            buffer = await videoToWebp(buff);
         }
         await conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, options);
      };
   }
   return msg;
}

module.exports = { serialize, downloadMedia, downloadAndSave };

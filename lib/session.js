const fs = require("fs").promises;
const path = require("path");
const { SESSION_ID } = require("../config");
const PastebinAPI = require("pastebin-js");
const { exec } = require("child_process");

const sessPath = path.resolve(__dirname, "../session");
const pastebin = new PastebinAPI("bR1GcMw175fegaIFV2PfignYVtF0b_Bl");

async function mkSessDir() {
   await fs.mkdir(sessPath, { recursive: true });
}

function decodeB64(str) {
   return Buffer.from(str, "base64").toString("utf-8");
}

async function wFile(fp, data) {
   await fs.writeFile(fp, data);
}

async function writeSession(sid = SESSION_ID) {
   await mkSessDir();
   const sessId = ("" + sid).replace(/Session~/gi, "").trim();

   if (sessId.length > 20) {
      const decoded = decodeB64(sessId);
      if (!decoded) {
         console.error("session error");
         exec("npm stop");
         return;
      }
      const parsed = JSON.parse(decoded);

      if (parsed["creds.json"]) {
         for (const [fname, fdata] of Object.entries(parsed)) {
            const content = typeof fdata === "string" ? fdata : JSON.stringify(fdata, null, 2);
            await wFile(path.join(sessPath, fname), content);
         }
      } else {
         await wFile(path.join(sessPath, "creds.json"), JSON.stringify(parsed, null, 2));
      }
   } else {
      const decodedData = await pastebin.getPaste(sessId).catch(() => {
         console.error("invalid session id");
         exec("npm stop");
         return;
      });

      if (decodedData) {
         await wFile(path.join(sessPath, "creds.json"), decodedData.toString());
      }
   }
   console.log("\x1b[1m%s\x1b[0m", "session connected");
}

module.exports = { writeSession };

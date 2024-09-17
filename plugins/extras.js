const fs = require("fs-extra");
const path = require("path");
const { buffThumb } = require("../media");
const { createCanvas, loadImage } = require("canvas");
const { Module, Ephoto360API, mode, sleep } = require("../lib");

function getAbsolutePath(relativePath) {
   const projectRoot = path.resolve(__dirname, "..");
   const absolutePath = path.join(projectRoot, relativePath);
   return absolutePath;
}

async function checkFileExists(filePath) {
   await fs.access(filePath, fs.constants.F_OK);
   return true;
}

async function generateImageWithText(imagePath, outputPath, text, x, y, maxWidth, maxLines, fontSize = "30") {
   await fs.ensureDir(path.dirname(outputPath));
   if (!(await checkFileExists(imagePath))) {
      throw new Error(`Input image not found: ${imagePath}`);
   }
   const image = await loadImage(imagePath);
   const canvas = createCanvas(image.width, image.height);
   const ctx = canvas.getContext("2d");

   ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
   ctx.font = `${fontSize}px Arial`;
   ctx.fillStyle = "black";
   ctx.textAlign = "left";
   ctx.textBaseline = "top";

   const lines = splitTextIntoLines(text, ctx, maxWidth);

   if (lines.length > maxLines) {
      lines.splice(maxLines);
      const lastLine = lines[maxLines - 1];
      const truncatedLine = lastLine.slice(0, lastLine.length - 10) + "...Read More";
      lines[maxLines - 1] = truncatedLine;
   }

   lines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * 25);
   });

   const buffer = canvas.toBuffer("image/png");
   await fs.writeFile(outputPath, buffer);

   return outputPath;
}

function splitTextIntoLines(text, ctx, maxWidth) {
   const words = text.split(" ");
   const lines = [];
   let currentLine = "";

   for (const word of words) {
      const testLine = currentLine === "" ? word : `${currentLine} ${word}`;
      const lineWidth = ctx.measureText(testLine).width;

      if (lineWidth <= maxWidth) {
         currentLine = testLine;
      } else {
         lines.push(currentLine);
         currentLine = word;
      }
   }

   if (currentLine !== "") {
      lines.push(currentLine);
   }

   return lines;
}

const memeCommands = [
   {
      pattern: "trump",
      image: "media/meme/trump.png",
      x: 70,
      y: 150,
      maxWidth: 700,
      maxLines: 4,
   },
   {
      pattern: "elon",
      image: "media/meme/elon.jpg",
      x: 60,
      y: 130,
      maxWidth: 900,
      maxLines: 5,
   },
   {
      pattern: "mark",
      image: "media/meme/mark.png",
      x: 30,
      y: 80,
      maxWidth: 500,
      maxLines: 3,
   },
   {
      pattern: "ronaldo",
      image: "media/meme/ronaldo.png",
      x: 50,
      y: 140,
      maxWidth: 600,
      maxLines: 4,
   },
];

memeCommands.forEach(({ pattern, image, x, y, maxWidth, maxLines }) => {
   Module(
      {
         pattern,
         fromMe: mode,
         desc: "Generates a meme with provided text",
         type: "memes",
      },
      async (message, match) => {
         if (!match) return await message.send("_Provide Text_");
         const imagePath = getAbsolutePath(image);
         const tempImage = getAbsolutePath(`temp/${pattern}.png`);
         const generatedImage = await generateImageWithText(imagePath, tempImage, ` ${match}`, x, y, maxWidth, maxLines, "35");
         const capMsg = `> BRAND PRODUCT OF ☞⌜ KG TECH⌝☜`;
         await sleep(1500);
         const buff = await buffThumb(generatedImage);
         await message.send(buff, { caption: capMsg });
      }
   );
});

Module(
   {
      pattern: "glossy",
      fromMe: mode,
      desc: "Logo Maker",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.glossysilver(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɢʟᴏssʏ sɪʟᴠᴇʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "write",
      fromMe: mode,
      desc: "Write Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.writetext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴡʀɪᴛᴇ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "blackpink",
      fromMe: mode,
      desc: "Blackpink Logo",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.blackpinklogo(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ʙʟᴀᴄᴋᴘɪɴᴋ ʟᴏɢᴏ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "glitch",
      fromMe: mode,
      desc: "Glitch Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.glitchtext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɢʟɪᴛᴄʜ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "glow",
      fromMe: mode,
      desc: "Advanced Glow",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.advancedglow(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴀᴅᴠᴀɴᴄᴇᴅ ɢʟᴏᴡ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "typography",
      fromMe: mode,
      desc: "Typography Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.typographytext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴛʏᴘᴏɢʀᴀᴘʜʏ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "pixel",
      fromMe: mode,
      desc: "Pixel Glitch",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.pixelglitch(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴘɪxᴇʟ ɢʟɪᴛᴄʜ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "neon",
      fromMe: mode,
      desc: "Neon Glitch",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.neonglitch(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɴᴇᴏɴ ɢʟɪᴛᴄʜ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "flag",
      fromMe: mode,
      desc: "Nigerian Flag",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.nigerianflag(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɴɪɢᴇʀɪᴀɴ ꜰʟᴀɢ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "american",
      fromMe: mode,
      desc: "American Flag",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.americanflag(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴀᴍᴇʀɪᴄᴀɴ ꜰʟᴀɢ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "deleting",
      fromMe: mode,
      desc: "Deleting Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.deletingtext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴅᴇʟᴇᴛɪɴɢ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "blackpink2",
      fromMe: mode,
      desc: "Blackpink Style",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.blackpinkstyle(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ʙʟᴀᴄᴋᴘɪɴᴋ ꜱᴛʏʟᴇ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "glowing",
      fromMe: mode,
      desc: "Glowing Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.glowingtext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɢʟᴏᴡɪɴɢ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "underwater",
      fromMe: mode,
      desc: "Underwater",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.underwater(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴜɴᴅᴇʀᴡᴀᴛᴇʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "logo2",
      fromMe: mode,
      desc: "Logo Maker",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.logomaker(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ʟᴏɢᴏ ᴍᴀᴋᴇʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "cartoon",
      fromMe: mode,
      desc: "Cartoon Style",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.cartoonstyle(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴄᴀʀᴛᴏᴏɴ ꜱᴛʏʟᴇ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "paper",
      fromMe: mode,
      desc: "Paper Cut",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.papercut(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴘᴀᴘᴇʀ ᴄᴜᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "watercolor",
      fromMe: mode,
      desc: "Watercolor",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.watercolor(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴡᴀᴛᴇʀᴄᴏʟᴏʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "carmen",
      fromMe: mode,
      desc: "Effect Clouds",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.effectclouds(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴄᴀʀᴍᴇɴ ᴄʟᴏᴜᴅꜱ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "gradient",
      fromMe: mode,
      desc: "Gradient Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.gradienttext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɢʀᴀᴅɪᴇɴᴛ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "summer",
      fromMe: mode,
      desc: "Summer Beach",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.summerbeach(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "sᴜᴍᴍᴇʀ ʙᴇᴀᴄʜ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "luxury",
      fromMe: mode,
      desc: "Luxury Gold",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.luxurygold(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ʟᴜxᴜʀʏ ɢᴏʟᴅ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "multicolored",
      fromMe: mode,
      desc: "Multicolored",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.multicolored(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴍᴜʟᴛɪᴄᴏʟᴏʀᴇᴅ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "sand",
      fromMe: mode,
      desc: "Sand Summer",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.sandsummer(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ꜱᴀɴᴅ ꜱᴜᴍᴍᴇʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "sandsummer",
      fromMe: mode,
      desc: "Sandsummer",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.sandsummer(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ꜱᴀɴᴅsᴜᴍᴍᴇʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "galaxy",
      fromMe: mode,
      desc: "Galaxy",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.galaxy(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɢᴀʟᴀxʏ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "kerm",
      fromMe: mode,
      desc: "Nineteen Seventeen",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.nineteenseventeen(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴋᴇʀᴍ 1𝟗𝟏𝟕",
            },
         },
      });
   }
);

Module(
   {
      pattern: "fareno",
      fromMe: mode,
      desc: "Making Neon",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.makingneon(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ꜰᴀʀᴇɴᴏ ɴᴇᴏɴ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "light",
      fromMe: mode,
      desc: "Text Effect",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.texteffect(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴛᴇxᴛ ʟɪᴛᴇ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "galaxy2",
      fromMe: mode,
      desc: "Galaxy Style",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.galaxystyle(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɢᴀlᴀxʏ2 ꜱᴛʏʟᴇ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "pink",
      fromMe: mode,
      desc: "Blackpink Style",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.blackpinkstyle(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴘɪɴᴋ ꜱᴛʏʟᴇ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "mirror",
      fromMe: mode,
      desc: "Glowing Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.glowingtext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ᴍɪʀʀᴏʀ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "neonlight",
      fromMe: mode,
      desc: "Advanced Glow",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.advancedglow(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɴᴇᴏɴʟɪɢʜᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "gold",
      fromMe: mode,
      desc: "Glossy Silver",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.glossysilver(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ɢᴏʟᴅ ꜱɪʟᴠᴇʀ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "shower",
      fromMe: mode,
      desc: "Writing Text",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.writetext(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "Sʜᴏᴡᴇʀ ᴛᴇxᴛ",
            },
         },
      });
   }
);

Module(
   {
      pattern: "logo5",
      fromMe: mode,
      desc: "Blackpink Logo",
      type: "eps",
   },
   async (m, match) => {
      if (!match) return await m.sendReply("_Give Me Text Man_");
      await m.sendReply("_Creating Design🪄_");
      const logo = new Ephoto360API();
      const img = await logo.blackpinklogo(match);
      return m.send(img, {
         contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
               newsletterJid: "120363321386877609@newsletter",
               newsletterName: "ʙʟᴀᴄᴋᴘɪɴᴋ ʟᴏɢᴏ",
            },
         },
      });
   }
);

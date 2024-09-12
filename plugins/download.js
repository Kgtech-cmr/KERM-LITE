const { Module, mode, toAudio, IronMan, Facebook, Instagram, Twitter, Tiktok, Pinterest, Spotify, Youtube } = require("../lib");

const fetchMedia = async (message, match, service, method) => {
   if (!match) return message.reply("_provide a valid URL_");
   await message.reply("_Downloading_");
   const request = new service();
   const buff = await request[method](match);
   return message.sendFile(buff);
};

Module({ pattern: "fb", fromMe: mode, desc: "Downloads Facebook Media", type: "download" }, (message, match) => fetchMedia(message, match, Facebook, "fbdl"));

Module({ pattern: "insta", fromMe: mode, desc: "Downloads Instagram Media", type: "download" }, (message, match) => fetchMedia(message, match, Instagram, "igdl"));

Module({ pattern: "twitter", fromMe: mode, desc: "Downloads Twitter Media", type: "download" }, (message, match) => fetchMedia(message, match, Twitter, "twitterdl"));

Module({ pattern: "tiktok", fromMe: mode, desc: "Downloads Tiktok Media", type: "download" }, (message, match) => fetchMedia(message, match, Tiktok, "tiktok"));

Module({ pattern: "pinterest", fromMe: mode, desc: "Downloads Pinterest Images", type: "download" }, async (message, match) => {
   if (!match) return message.reply("_provide a search query_");
   await message.reply("_Searching_");
   const request = new Pinterest();
   const buffers = await request.pintimgs(match);
   for (const buffer of buffers) {
      await message.sendFile(buffer);
   }
});

Module({ pattern: "spotify", fromMe: mode, desc: "Downloads Spotify Music", type: "download" }, async (message, match) => {
   if (!match) return message.reply("_provide Spotify URL_");
   await message.reply("_Downloading_");
   const request = new Spotify();
   const buff = await request.spotify(match);
   const audio = await toAudio(buff, "mp3");
   return message.sendMessage(message.jid, audio, { mimetype: "audio/mpeg" }, "audio");
});

Module({ pattern: "ytv", fromMe: mode, desc: "Downloads Youtube Videos", type: "download" }, (message, match) => fetchMedia(message, match, Youtube, "youtube"));

Module({ pattern: "yta", fromMe: mode, desc: "Download Youtube Music Audio", type: "download" }, (message, match) => fetchMedia(message, match, Youtube, "ytmp3"));

Module({ pattern: "story", fromMe: mode, desc: "Downloads Instagram stories", type: "download" }, async (message, match) => {
   if (!match) return message.reply("_Provide a valid Instagram username_");
   await message.reply(`_Downloading stories of ${match}..._`);
   const res = await fetch(IronMan(`ironman/ig/story?user=${match}`));
   const data = await res.json();
   if (!data.status || !data.media.length) return message.reply("_No stories found or account is private_");
   for (const dl of data.media) {
      await message.sendFile(dl);
   }
});

Module({ pattern: "play", fromMe: mode, desc: "Fetches Songs", type: "download" }, async (msg, cont) => {
   const { prefix } = msg.prefix;
   if (!cont) return msg.sendReply(`_Provide song name_\n\n${prefix} play Just the two of us`);
   await msg.sendReply("_Downloading_");
   const request = new Youtube();
   let audio = await request.play(cont);
   audio = await toAudio(audio, "mp3");
   return msg.sendMessage(msg.jid, audio, { mimetype: "audio/mpeg" }, "audio");
});

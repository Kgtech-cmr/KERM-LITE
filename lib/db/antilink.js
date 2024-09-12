const { DATABASE } = require("../../config");
const { DataTypes } = require("sequelize");

const AntiLink = DATABASE.define("antiLink", {
   chat: { type: DataTypes.STRING, allowNull: false },
   context: { type: DataTypes.TEXT, allowNull: false },
});

const AntiWord = DATABASE.define("antiWord", {
   chat: { type: DataTypes.STRING, allowNull: false },
   context: { type: DataTypes.TEXT, allowNull: false },
});

const AntiSpam = DATABASE.define("antiSpam", {
   chat: { type: DataTypes.STRING, allowNull: false },
   context: { type: DataTypes.TEXT, allowNull: false },
});

const cache = {
   antilink: {},
   spam: {},
   word: {},
};

const formatAllowedUrls = urls =>
   urls
      .split(",")
      .map(url => url.trim())
      .join(",");

exports.setAntiLink = async (chatId, setting) => {
   delete cache.antilink[chatId];

   const isEnabled = typeof setting === "boolean" ? setting : undefined;
   const action = /action\/(kick|warn|null)/.test(setting) ? setting.replace("action/", "") : undefined;
   const allowedUrls = action === undefined && isEnabled === undefined ? setting : undefined;

   const [antiLink, created] = await AntiLink.findOrCreate({
      where: { chat: chatId },
      defaults: { context: JSON.stringify({}) }, // Set a default empty object for context
   });

   let context;
   if (created) {
      context = {};
   } else {
      context = JSON.parse(antiLink.context || "{}");
   }

   Object.assign(context, {
      enabled: isEnabled ?? context.enabled ?? false,
      action: action ?? context.action ?? "kick",
      allowedUrls: formatAllowedUrls(allowedUrls || context.allowedUrls || "null"),
   });

   await antiLink.update({ context: JSON.stringify(context) });

   const urls = context.allowedUrls.split(",");
   return {
      notallow: urls.filter(url => url.startsWith("!")).map(url => url.replace("!", "")),
      allow: urls.filter(url => !url.startsWith("!")),
   };
};

exports.getAntiLink = async chatId => {
   if (chatId in cache.antilink) return cache.antilink[chatId];

   const antiLink = await AntiLink.findOne({ where: { chat: chatId } });
   if (!antiLink) {
      cache.antilink[chatId] = false;
      return false;
   }

   const context = JSON.parse(antiLink.context);
   cache.antilink[chatId] = context;
   return context;
};

exports.setSpam = async (type, setting, chatId = "0") => {
   delete cache.spam[type];

   const isEnabled = typeof setting === "boolean" ? setting : undefined;
   const spamType = isEnabled === undefined ? setting : undefined;

   const [antiSpam] = await AntiSpam.findOrCreate({ where: { chat: chatId } });
   const context = JSON.parse(antiSpam.context || "{}");

   Object.assign(context, {
      [type]: {
         enabled: isEnabled ?? context[type]?.enabled ?? false,
         type: spamType ?? context[type]?.type ?? "null",
      },
   });

   await antiSpam.update({ context: JSON.stringify(context) });
   return context[type];
};

exports.getSpam = async (type, chatId = "0") => {
   if (type in cache.spam) return cache.spam[type];

   const antiSpam = await AntiSpam.findOne({ where: { chat: chatId } });
   if (!antiSpam) {
      cache.spam[type] = { enabled: false, type: "" };
      return cache.spam[type];
   }

   const context = JSON.parse(antiSpam.context);
   cache.spam[type] = context[type] || { enabled: false, type: "" };
   return cache.spam[type];
};

exports.setWord = async (type, setting, chatId = "1") => {
   delete cache.word[type];

   const isEnabled = typeof setting === "boolean" ? setting : undefined;
   const action = isEnabled === undefined ? setting : undefined;

   const [antiWord] = await AntiWord.findOrCreate({
      where: { chat: chatId },
      defaults: { context: JSON.stringify({}) },
   });

   const context = JSON.parse(antiWord.context || "{}");

   Object.assign(context, {
      [type]: {
         enabled: isEnabled ?? context[type]?.enabled ?? false,
         action: action ?? context[type]?.action ?? "null",
         words: context[type]?.words ?? "",
      },
   });

   await antiWord.update({ context: JSON.stringify(context) });
   return context[type];
};

exports.getWord = async (type, chatId = "1") => {
   if (type in cache.word) return cache.word[type];

   const antiWord = await AntiWord.findOne({ where: { chat: chatId } });
   if (!antiWord) {
      cache.word[type] = { enabled: false, action: "null", words: "" };
      return cache.word[type];
   }

   const context = JSON.parse(antiWord.context);
   cache.word[type] = context[type] || {
      enabled: false,
      action: "null",
      words: "",
   };
   return cache.word[type];
};

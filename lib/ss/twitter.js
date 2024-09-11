const axios = require("axios");
const cheerio = require("cheerio");

class Twitter {
   constructor() {
      this.api = "https://astro-api-crqy.onrender.com";
   }

   async xinfo(url) {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      return {
         title: $('meta[property="og:title"]').attr("content") || $("title").text(),
         description: $('meta[property="og:description"]').attr("content") || "",
      };
   }

   async twitterdl(query) {
      const { data } = await axios.get(`${this.api}/api/twitter-download?url=${encodeURIComponent(query.trim())}`, { responseType: "json" });
      const media = await axios.get(data.url, { responseType: "arraybuffer" });
      return Buffer.from(media.data);
   }
}

module.exports = Twitter;

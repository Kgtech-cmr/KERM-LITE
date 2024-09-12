const axios = require("axios");
const cheerio = require("cheerio");

class Facebook {
   constructor() {
      this.api = "https://astro-api-crqy.onrender.com";
   }

   async fbmeta(url) {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      return {
         title: $('meta[property="og:title"]').attr("content"),
         description: $('meta[property="og:description"]').attr("content"),
      };
   }

   async fbdl(query) {
      const { data } = await axios.get(`${this.api}/api/facebook-download?url=${encodeURIComponent(query.trim())}`, { responseType: "json" });
      const video = await axios.get(data.data.hd, { responseType: "arraybuffer" });
      return Buffer.from(video.data);
   }
}

module.exports = Facebook;

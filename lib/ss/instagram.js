const axios = require("axios");
const cheerio = require("cheerio");

class Instagram {
   constructor() {
      this.api = "https://ironman.koyeb.app/ironman/dl/v2/insta?url=";
   }

   async iginfo(url) {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      return {
         title: $('meta[property="og:title"]').attr("content"),
         description: $('meta[property="og:description"]').attr("content"),
      };
   }

   async igdl(query) {
      const { data } = await axios.get(this.api + encodeURIComponent(query.trim()), { responseType: "json" });
      const media = await axios.get(data.media[0], { responseType: "arraybuffer" });
      return Buffer.from(media.data);
   }
}

module.exports = Instagram;

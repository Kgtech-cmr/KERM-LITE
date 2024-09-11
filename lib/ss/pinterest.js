const axios = require("axios");

class Pinterest {
   constructor() {
      this.api = `https://astro-api-crqy.onrender.com/`;
   }
   async pintimgs(query) {
      const { data } = await axios.get(`${this.api}api/pinterest-download?query=${encodeURIComponent(query.trim())}`, { responseType: "json" });
      return Promise.all(
         data.results.map(async url => {
            const { data } = await axios.get(url, { responseType: "arraybuffer" });
            return Buffer.from(data);
         })
      );
   }
}

module.exports = Pinterest;

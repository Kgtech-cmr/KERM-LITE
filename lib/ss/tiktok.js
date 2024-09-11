const axios = require("axios");

class Tiktok {
   async tiktok(query) {
      const { data } = await axios.get(`https://astro-api-crqy.onrender.com/api/spotify-download?url=${encodeURIComponent(query.trim())}`, { responseType: "json" });
      const { url } = data;
      const { data: bufferData } = await axios.get(url, { responseType: "arraybuffer" });
      return Buffer.from(bufferData);
   }
}

module.exports = Tiktok;

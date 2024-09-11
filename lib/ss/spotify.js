const axios = require("axios");

class Spotify {
   async spotify(query) {
      const { data } = await axios.get(`https://astro-api-crqy.onrender.com/api/spotify-download?url=${encodeURIComponent(query.trim())}`, { responseType: "json" });
      const { link } = data.data;
      const { data: bufferData } = await axios.get(link, { responseType: "arraybuffer" });
      return Buffer.from(bufferData);
   }
}

module.exports = Spotify;

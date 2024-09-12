const axios = require("axios");
const ytSearch = require("yt-search");

class Youtube {
   constructor() {
      this.api = "https://astro-api-crqy.onrender.com";
   }

   async download(type, query) {
      const { data } = await axios.get(`${this.api}/api/youtube-${type}-download?url=${encodeURIComponent(query.trim())}`, { responseType: "json" });
      const media = await axios.get(data.url || data.audio, { responseType: "arraybuffer" });
      return Buffer.from(media.data);
   }

   youtube(query) {
      return this.download("video", query);
   }

   ytmp3(query) {
      return this.download("mp3", query);
   }

   async fetchSong(query) {
      const { videos } = await ytSearch(query);
      if (!videos.length) throw new Error("No videos found.");
      return videos[0].url;
   }

   async play(query) {
      return this.ytmp3(await this.fetchSong(query));
   }
}

module.exports = Youtube;

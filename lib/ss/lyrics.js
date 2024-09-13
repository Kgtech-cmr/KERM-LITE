const axios = require("axios");
const gifted_api = `https://api.giftedtechnexus.co.ke/api/`;
async function lyrics(songName) {
   const encodeSong = encodeURIComponent(songName.trim());
   const url = `search/lyrics?query=${encodeSong}&apikey=giftedtechk`;
   const response = await axios.get(gifted_api + url);
   const data = response.data.result;
   const songLyrics = `*🎙️Artist: ${data.Artist}*\n*📀Song: ${data.Title}*\n📝Lyrics: ${data.Lyrics}`;
   return songLyrics;
}
module.exports = { lyrics };

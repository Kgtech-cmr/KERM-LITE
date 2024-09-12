const axios = require("axios");
const gifted_api = `https://api.giftedtechnexus.co.ke/api/`;
async function lyrics(songName) {
   const encodeSong = encodeURIComponent(songName.trim());
   const url = `search/lyrics?query=${encodeSong}&apikey=giftedtechk`;
   const response = await axios.get(gifted_api + url);
   const data = response.data.result;
   const songLyrics = `*𝔸𝕣𝕥𝕚𝕤𝕥: ${data.Artist}*\n*𝕊𝕠𝕟𝕘: ${data.Title}*\n𝕃𝕪𝕣𝕚𝕔𝕤: ${data.Lyrics}`;
   return songLyrics;
}
module.exports = { lyrics };

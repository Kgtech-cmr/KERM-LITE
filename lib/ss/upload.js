const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
async function upload(filePath) {
   return new Promise(async (resolve, reject) => {
      const form = new FormData();
      form.append("files[]", fs.createReadStream(filePath));

      try {
         const response = await axios({
            url: "https://uguu.se/upload.php",
            method: "POST",
            headers: {
               "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
               ...form.getHeaders(),
            },
            data: form,
         });

         resolve(response.data.files[0]);
      } catch (error) {
         reject(error);
      }
   });
}
module.exports = { upload };

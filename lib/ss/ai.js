const axios = require("axios");
const FormData = require("form-data");
const gTTS = require("gtts");

class AIService {
   constructor() {
      this.aiApi = "https://api.vihangayt.com/";
      this.giftedApi = "https://api.giftedtechnexus.co.ke/api/";
      this.baseUrl = "https://ironman.koyeb.app/";
      this.apiKey = "Ir0n-M4n_xhf04";
      this.imageApiKey = "img-1r0nm4nH4x!";
   }

   async coderAi(code) {
      const response = await axios.get(`${this.aiApi}ai/codemirror?q=${encodeURIComponent(code.trim())}`);
      return response.data.data.prediction;
   }

   async gpt4(question) {
      const response = await axios.get(`${this.aiApi}ai/gpt4-v2?q=${encodeURIComponent(question.trim())}`);
      return response.data.data;
   }

   async lamda(question) {
      const response = await axios.get(`${this.aiApi}ai/lamda?q=${encodeURIComponent(question.trim())}`);
      return response.data.data;
   }

   async stableDiff(query) {
      const response = await axios.get(`${this.giftedApi}ai/sd?prompt=${encodeURIComponent(query)}&apikey=giftedtechk`, { responseType: "arraybuffer" });
      return Buffer.from(response.data);
   }

   async askAi(aiType, query) {
      const apiPaths = {
         aoyo: "ironman/ai/aoyo",
         thinkany: "ironman/ai/thinkany",
         prodia: "ironman/ai/prodia",
         lepton: "ironman/ai/llm",
         gpt: "ironman/ai/gpt",
         blackbox: "ironman/ai/blackbox",
         chatgpt: "ironman/ai/chatev",
         dalle: "ironman/ai/dalle",
         upscale: "ironman/ai/upscale",
      };

      try {
         switch (aiType) {
            case "aoyo":
               const { data: aoyoResponse } = await axios.get(`${this.baseUrl}${apiPaths.aoyo}`, { headers: { ApiKey: this.apiKey }, params: { query } });
               return aoyoResponse;

            case "thinkany":
               const { data: thinkanyResponse } = await axios.get(`${this.baseUrl}${apiPaths.thinkany}`, { headers: { ApiKey: this.apiKey }, params: { query } });
               return thinkanyResponse;

            case "prodia":
               return `${this.baseUrl}${apiPaths.prodia}?prompt=${query}&ApiKey=${this.imageApiKey}`;

            case "lepton":
               const { data: leptonResponse } = await axios.get(`${this.baseUrl}${apiPaths.lepton}`, { headers: { ApiKey: this.apiKey }, params: { query } });
               return leptonResponse;

            case "gpt":
               const { data: gptResponse } = await axios.get(`${this.baseUrl}${apiPaths.gpt}`, { headers: { ApiKey: this.apiKey }, params: { prompt: query } });
               return gptResponse;

            case "blackbox":
               const { data: blackboxResponse } = await axios.get(`${this.baseUrl}${apiPaths.blackbox}`, { headers: { ApiKey: this.apiKey }, params: { query } });
               return blackboxResponse;

            case "chatgpt":
               const { data: chatgptResponse } = await axios.get(`${this.baseUrl}${apiPaths.chatgpt}`, { headers: { ApiKey: this.apiKey }, params: { prompt: query } });
               return chatgptResponse;

            case "dalle":
               return `${this.baseUrl}${apiPaths.dalle}?text=${encodeURIComponent(query)}&ApiKey=${this.imageApiKey}`;

            case "upscale":
               if (!Buffer.isBuffer(query)) throw new Error("Expected a buffer for the image.");
               const formData = new FormData();
               formData.append("image", query, { filename: "image.jpg" });
               const { data: upscaleResponse } = await axios.post(`${this.baseUrl}${apiPaths.upscale}`, formData, {
                  headers: { ...formData.getHeaders(), ApiKey: this.imageApiKey },
                  responseType: "arraybuffer",
               });
               return upscaleResponse;

            default:
               throw new Error("Invalid AI type provided.");
         }
      } catch (error) {
         console.error(`Error interacting with AI: ${error.message}`);
         throw error;
      }
   }

   async dalle(prompt) {
      const response = await axios.get(`https://api.gurusensei.workers.dev/dream?prompt=${encodeURIComponent(prompt)}`, { responseType: "arraybuffer" });
      return Buffer.from(response.data);
   }

   async bing(query) {
      const response = await axios.get(`https://gpt4.guruapi.tech/bing?username=astro&query=${encodeURIComponent(query)}`);
      return response.data.result;
   }

   async elevenlabs(text) {
      const response = await axios.get(`https://astro-api-crqy.onrender.com/api/generate-audio?text=${encodeURIComponent(text)}`, { responseType: "arraybuffer" });
      return Buffer.from(response.data);
   }

   tts(text) {
      return new Promise((resolve, reject) => {
         const gtts = new gTTS(text, "en");
         const stream = gtts.stream();
         const chunks = [];
         stream.on("data", chunk => chunks.push(chunk));
         stream.on("end", () => resolve(Buffer.concat(chunks)));
         stream.on("error", reject);
      });
   }
}

module.exports = AIService;

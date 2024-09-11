const axios = require("axios");

class Ephoto360API {
  constructor() {
    this.baseURL =
      "https://pure-badlands-26930-091903776676.herokuapp.com/api/ephoto360";
  }

  async fetchImageBuffer(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data, "binary");
    } catch (error) {
      console.error("Error fetching image buffer:", error.message);
      throw new Error("Failed to fetch image buffer");
    }
  }

  async callEphoto360Api(endpoint, text) {
    try {
      const response = await axios.get(`${this.baseURL}/${endpoint}`, {
        params: { text },
      });
      if (response.data.status === 200 && response.data.success) {
        const imageUrl = response.data.result.Astro.image_url;
        return await this.fetchImageBuffer(imageUrl);
      } else {
        throw new Error("Failed to fetch image from API");
      }
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error.message);
      throw error;
    }
  }

  async glossysilver(text) {
    return await this.callEphoto360Api("glossysilver", text);
  }

  async writetext(text) {
    return await this.callEphoto360Api("writetext", text);
  }

  async blackpinklogo(text) {
    return await this.callEphoto360Api("blackpinklogo", text);
  }

  async glitchtext(text) {
    return await this.callEphoto360Api("glitchtext", text);
  }

  async advancedglow(text) {
    return await this.callEphoto360Api("advancedglow", text);
  }

  async typographytext(text) {
    return await this.callEphoto360Api("typographytext", text);
  }

  async pixelglitch(text) {
    return await this.callEphoto360Api("pixelglitch", text);
  }

  async neonglitch(text) {
    return await this.callEphoto360Api("neonglitch", text);
  }

  async nigerianflag(text) {
    return await this.callEphoto360Api("nigerianflag", text);
  }

  async americanflag(text) {
    return await this.callEphoto360Api("americanflag", text);
  }

  async deletingtext(text) {
    return await this.callEphoto360Api("deletingtext", text);
  }

  async blackpinkstyle(text) {
    return await this.callEphoto360Api("blackpinkstyle", text);
  }

  async glowingtext(text) {
    return await this.callEphoto360Api("glowingtext", text);
  }

  async underwater(text) {
    return await this.callEphoto360Api("underwater", text);
  }

  async logomaker(text) {
    return await this.callEphoto360Api("logomaker", text);
  }

  async cartoonstyle(text) {
    return await this.callEphoto360Api("cartoonstyle", text);
  }

  async papercut(text) {
    return await this.callEphoto360Api("papercut", text);
  }

  async watercolor(text) {
    return await this.callEphoto360Api("watercolor", text);
  }

  async effectclouds(text) {
    return await this.callEphoto360Api("effectclouds", text);
  }

  async gradienttext(text) {
    return await this.callEphoto360Api("gradienttext", text);
  }

  async summerbeach(text) {
    return await this.callEphoto360Api("summerbeach", text);
  }

  async luxurygold(text) {
    return await this.callEphoto360Api("luxurygold", text);
  }

  async multicolored(text) {
    return await this.callEphoto360Api("multicolored", text);
  }

  async sandsummer(text) {
    return await this.callEphoto360Api("sandsummer", text);
  }

  async galaxy(text) {
    return await this.callEphoto360Api("galaxy", text);
  }

  async nineteenseventeen(text) {
    return await this.callEphoto360Api("nineteenseventeen", text);
  }

  async makingneon(text) {
    return await this.callEphoto360Api("makingneon", text);
  }

  async texteffect(text) {
    return await this.callEphoto360Api("texteffect", text);
  }

  async galaxystyle(text) {
    return await this.callEphoto360Api("galaxystyle", text);
  }

  async lighteffect(text) {
    return await this.callEphoto360Api("lighteffect", text);
  }
}
module.exports = { Ephoto360API };

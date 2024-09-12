const fs = require("fs").promises;
const path = require("path");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseDir = async (directory) => {
  const files = await fs.readdir(directory);
  const jsFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".js",
  );

  const results = [];

  for (const file of jsFiles) {
    try {
      const filePath = path.join(directory, file);
      const module = require(filePath);
      results.push(module);
    } catch (error) {
      console.error(`Error in file ${file}:`, error);
      await delay(3000);
    }
  }

  return results;
};

module.exports = { parseDir };

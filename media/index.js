const fs = require("fs-extra");
const path = require("path");

async function buffThumb(filePath) {
  console.log("buffThumb called with:", filePath);

  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    console.log("Absolute path:", absolutePath);

    if (!(await fs.pathExists(absolutePath))) {
      console.error("File does not exist:", absolutePath);
      throw new Error("File not found");
    }

    const buffer = await fs.readFile(absolutePath);
    console.log("File read successfully, buffer length:", buffer.length);
    return buffer;
  } catch (error) {
    console.error("Error in buffThumb:", error);
    throw error;
  }
}

/**
 * Function to read a file from a given path and return its content as a buffer.
 * @param {string} relativePath - The relative path to the file.
 * @returns {Promise<Buffer>} - A promise that resolves with the file buffer.
 */
const buffpath = async (relativePath) => {
  try {
    const filePath = path.join(__dirname, relativePath);
    const fileBuffer = await fs.promises.readFile(filePath);
    return fileBuffer;
  } catch (error) {
    console.error(`Error reading file from path: ${relativePath}`, error);
    throw error;
  }
};

module.exports = { buffThumb, buffpath };

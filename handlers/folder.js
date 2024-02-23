const fs = require("fs");
const path = require("path");

class Folder {
  static getFiles(folderPath) {
    return fs
      .readdirSync(folderPath)
      .map((fileName) => path.join(folderPath, fileName));
  }

  static getJSFiles(folderPath) {
    return this.getFiles(folderPath).filter((filePath) =>
      filePath.endsWith(".js"),
    );
  }

  static isDirectory(filePath) {
    return fs.lstatSync(filePath).isDirectory();
  }

  static getFolders(folderPath) {
    return this.getFiles(folderPath).filter((filePath) =>
      this.isDirectory(filePath),
    );
  }
}

module.exports = Folder;

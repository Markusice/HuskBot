const fs = require("fs");
const path = require("path");

const Folder = require("./folder.js");

module.exports = (client) => {
  const commandsFolderPath = path.resolve(__dirname, "../commands");

  Folder.getFolders(commandsFolderPath).forEach((folder) => {
    Folder.getJSFiles(folder).forEach((file) => {
      const command = require(file);

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] The command at ${file} is missing a required "data" or "execute" property.`,
        );
      }
    });
  });
};

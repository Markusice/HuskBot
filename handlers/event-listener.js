const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");

const Folder = require("./folder.js");

module.exports = (client) => {
  const eventsTable = new ascii().setHeading("Events", "Status");
  const eventsFolderPath = path.resolve(__dirname, "../events");

  Folder.getFolders(eventsFolderPath).forEach((folder) => {
    Folder.getJSFiles(folder).forEach((file) => {
      const event = require(file);

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }

      eventsTable.addRow(path.basename(file), "loaded");
    });
  });

  console.log(eventsTable.toString());
};

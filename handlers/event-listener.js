const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const eventsTable = new ascii().setHeading("Events", "Status");
  const eventsFolderPath = path.resolve(__dirname, "../events");

  fs.readdirSync(eventsFolderPath).forEach((folderName) => {
    const folderPath = path.join(eventsFolderPath, folderName);
    const files = fs
      .readdirSync(folderPath)
      .filter((folder) => !folder.startsWith("."))
      .filter((file) => file.endsWith(".js"));

    files.forEach((file) => {
      const filePath = path.join(path.join(folderPath, file));
      const event = require(filePath);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      eventsTable.addRow(file, "loaded");
    });
  });
  console.log(eventsTable.toString());
};

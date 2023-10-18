require("dotenv").config();

const { REST, Routes } = require("discord.js");
const ascii = require("ascii-table");
const fs = require("fs");
const path = require("path");

module.exports = () => {
  const clientId = process.env.CLIENT_ID;
  // const guildId = process.env.GUILD_ID;
  const token = process.env.DISCORD_TOKEN;
  const commandsTable = new ascii().setHeading("Commands", "Status");

  const commands = [];
  // Grab all the command files from the commands directory you created earlier
  const foldersPath = path.resolve(__dirname, "../commands");
  const commandFolders = fs
    .readdirSync(foldersPath)
    .filter((folder) => !folder.startsWith("."));

  for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
        // console.log(command.data.toJSON());
        commandsTable.addRow(file, "loaded");
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
  console.log(commandsTable.toString());

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token);

  // and deploy your commands!
  (async () => {
    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      );

      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(
        Routes.applicationCommands(clientId),
        // Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      );
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
    }
  })();
};

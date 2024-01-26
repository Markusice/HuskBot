require("dotenv").config();

const mongoose = require("mongoose");
const databaseToken = process.env.DATABASE_TOKEN;
const chalk = require("chalk");

console.log(chalk.magenta("[Client] Starting..."));

mongoose.connect(databaseToken).catch((error) => console.error(error));

mongoose.connection.on("connected", () =>
  console.log(chalk.cyan("[MongoDB] Connected")),
);

mongoose.connection.on("error", (err) => {
  console.error(err);
});

const eventListener = require("./handlers/event-listener");
const deployCommands = require("./handlers/deploy-commands");
const loadCommands = require("./handlers/load-commands");

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

module.exports = client;

const token = process.env.DISCORD_TOKEN;
client.login(token).then(() => {
  eventListener(client);
  loadCommands(client);
  deployCommands();
});

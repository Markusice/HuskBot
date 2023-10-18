require("dotenv").config();

const chalk = require("chalk");
const mongoose = require("mongoose");
const databaseToken = process.env.DATABASE_TOKEN;

mongoose.connect(databaseToken).then(
  () => {
    console.log(chalk.magenta("[MongoDB] Connected to database!"));
  },
  (err) => {
    console.error(err.message);
  }
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

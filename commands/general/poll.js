const { EmbedBuilder } = require("@discordjs/builders");
const { SlashCommandBuilder } = require("discord.js");
const InformationEmbed = require("../../embeds/information-embed.js");
const ErrorEmbed = require("../../embeds/error-embed.js");

const SubCommands = {
  CREATE: "create",
  SHOW: "show",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Poll command")
    .setDMPermission(false)
    .addSubcommand((subcommand) => {
      subcommand
        .setName(SubCommands.CREATE)
        .setDescription("Start a poll (max 10 choices)")
        .addStringOption((option) =>
          option.setName("message").setDescription("Message").setRequired(true),
        );

      setRequiredChoices(subcommand);
      setOptionalChoices(subcommand);

      return subcommand;
    })

    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubCommands.SHOW)
        .setDescription("Show the results of a poll")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Message ID/Link")
            .setRequired(true),
        ),
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case SubCommands.CREATE: {
        const message = interaction.options.getString("message");
        const reactionSymbols = [
          "1️⃣",
          "2️⃣",
          "3️⃣",
          "4️⃣",
          "5️⃣",
          "6️⃣",
          "7️⃣",
          "8️⃣",
          "9️⃣",
          "🔟",
        ];
        const userChoices = [];

        getUserChoices(userChoices, interaction);

        const pollEmbed = new InformationEmbed(message).embed
          .setFooter({ text: `Poll by ${interaction.user.username}` })
          .setTimestamp();

        userChoices.forEach((choice, index) => {
          pollEmbed.addFields({
            name: `${reactionSymbols[index]} ${choice}`,
            value: "\n",
          });
        });

        try {
          await interaction.deferReply();

          const message = await interaction.editReply({
            embeds: [pollEmbed],
            fetchReply: true,
          });

          userChoices.forEach(async (_, index) => {
            await message.react(reactionSymbols[index]);
          });
        } catch (error) {
          console.error(error);
        }
        break;
      }

      case SubCommands.SHOW: {
        const messageID = interaction.options.getString("message");

        try {
          await interaction.deferReply();

          await getMessageByID(interaction, messageID);
        } catch (error) {
          console.error(error);
        }
        break;
      }
    }
  },
};

function setRequiredChoices(subcommand) {
  for (let i = 0; i < 2; i++) {
    subcommand.addStringOption((option) =>
      option
        .setName(`choice${i + 1}`)
        .setDescription(`Choice ${i + 1}`)
        .setRequired(true),
    );
  }
}

function setOptionalChoices(subcommand) {
  for (let i = 2; i < 10; i++) {
    subcommand.addStringOption((option) =>
      option
        .setName(`choice${i + 1}`)
        .setDescription(`Choice ${i + 1}`)
        .setRequired(false),
    );
  }
}

function getUserChoices(userChoices, interaction) {
  getRequiredChoices(userChoices, interaction);
  getOptionalChoices(userChoices, interaction);
}

function getRequiredChoices(userChoices, interaction) {
  for (let i = 0; i < 2; i++) {
    const choiceContent = interaction.options.getString(`choice${i + 1}`);
    userChoices.push(choiceContent);
  }
}

function getOptionalChoices(userChoices, interaction) {
  for (let i = 2; i < 10; i++) {
    const choiceContent = interaction.options.getString(`choice${i + 1}`);
    if (choiceContent) userChoices.push(choiceContent);
  }
}

async function getMessageByID(interaction, messageID) {
  return await interaction.channel.messages
    .fetch(messageID)
    .then(async (message) => {
      const isFromClient = await isMessageFromClient(
        interaction,
        message,
        interaction.client.user.id,
      );

      if (!isFromClient) return;

      const isPoll = await isMessagePoll(interaction, message);
      if (isPoll) showPollResult(interaction, message);
    })
    .catch(async () => {
      const errorEmbed = new ErrorEmbed("Message not found").embed;
      await interaction.editReply({
        embeds: [errorEmbed],
      });
    });
}

async function isMessageFromClient(interaction, message, clientID) {
  if (message.author.id !== clientID) {
    const errorEmbed = new ErrorEmbed("Message isn't from the bot").embed;

    await interaction.editReply({
      embeds: [errorEmbed],
    });

    return false;
  }
  return true;
}

async function isMessagePoll(interaction, message) {
  const embeds = message.embeds;
  const errorEmbed = new ErrorEmbed("Message isn't a poll message").embed;

  if (embeds.length !== 1) {
    await interaction.editReply({
      embeds: [errorEmbed],
    });

    return false;
  }

  const embed = embeds[0];
  const footer = embed.footer;

  if (!footer) {
    await interaction.editReply({
      embeds: [errorEmbed],
    });

    return false;
  }

  if (!footer.text.includes("Poll")) {
    await interaction.editReply({
      embeds: [errorEmbed],
    });

    return false;
  }
  return true;
}

async function showPollResult(interaction, message) {
  const reactions = message.reactions.cache;
  const embedResult = new InformationEmbed("Poll results").embed
    .setFooter({
      text: `Poll by ${message.interaction.user.username}`,
    })
    .setTimestamp(message.createdAt);

  let counter = 0;
  reactions.each((messageReaction) => {
    const usersCount = messageReaction.count - 1;

    const messageEmbed = messageReaction.message.embeds[0];
    const messageContent = messageEmbed.fields[counter].name;
    const messageContentWithoutSymbol = messageContent.slice(4);

    embedResult.addFields({
      name: `${messageContentWithoutSymbol}`,
      value: `Votes: \`${usersCount}\``,
      inline: true,
    });
    counter++;
  });

  return await interaction.editReply({
    embeds: [embedResult],
  });
}

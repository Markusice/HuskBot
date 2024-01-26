const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ComponentType,
  StringSelectMenuBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows a list of all commands")
    .setDMPermission(false),
  async execute(interaction) {
    const emojis = {
      music: "🎶",
      moderation: "⚒️",
      general: "⚙️",
      info: "🗒️",
    };

    const directories = [
      ...new Set(interaction.client.commands.map((cmd) => cmd.folder)),
    ];
    console.log(interaction.client.commands.map(({ data }) => data));

    const formatString = (str) =>
      `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

    const categories = directories.map((dir) => {
      const getCommands = interaction.client.commands
        .filter((cmd) => cmd.folder === dir)
        .map((cmd) => {
          return {
            name: cmd.data.name,
            description: cmd.data.description || "There is no description",
          };
        });
      return {
        directory: formatString(dir),
        commands: getCommands,
      };
    });

    const embed = new EmbedBuilder()
      .setColor(0x8860d0)
      .setDescription("Choose a category in the dropdown menu");

    const components = (state) => [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Select a category")
          .setDisabled(state)
          .addOptions(
            categories.map((cmd) => {
              return {
                label: cmd.directory,
                value: cmd.directory.toLowerCase(),
                description: `Commands from ${cmd.directory} category`,
                emoji: emojis[cmd.directory.toLowerCase() || null],
              };
            }),
          ),
      ),
    ];

    const initialMessage = await interaction.reply({
      embeds: [embed],
      components: components(false),
      ephemeral: true,
    });

    const filter = (interaction) =>
      interaction.user.id === interaction.member.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      componentType: ComponentType.StringSelect,
    });

    collector.on("collect", (interaction) => {
      const [directory] = interaction.values;
      const category = categories.find(
        (x) => x.directory.toLowerCase() === directory,
      );

      const categoryEmbed = new EmbedBuilder()
        .setColor(0x8860d0)
        .setTitle(`${formatString(directory)} commands`)
        .setDescription(`List of all ${directory} commands`)
        .addFields(
          category.commands.map((cmd) => {
            return {
              name: `❯\t**${cmd.name}**`,
              value: `> ${cmd.description}`,
              inline: true,
            };
          }),
        );

      interaction.update({ embeds: [categoryEmbed] });
    });

    collector.on("end", () => {
      initialMessage.edit({ components: components(true) });
    });
  },
};

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ComponentType,
  PermissionsBitField,
} = require("discord.js");
const Link = require("../../schemas/link");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dblink")
    .setDescription("Database Links Commands")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a new database link")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Name of the link")
            .setRequired(true)
            .setMinLength(1)
        )
        .addStringOption((option) =>
          option
            .setName("url")
            .setDescription("URL of the link")
            .setRequired(true)
            .setMinLength(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("show")
        .setDescription("Show all your guild's links")
        .addIntegerOption((option) =>
          option
            .setName("page")
            .setDescription("Number of the page")
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("rem")
        .setDescription("Remove a database link")
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Name of the link")
            .setRequired(true)
            .setMinLength(1)
        )
    ),
  async execute(interaction) {
    const { guildId } = interaction;
    const embed = new EmbedBuilder().setColor(0x8860d0);

    try {
      switch (interaction.options.getSubcommand()) {
        case "add": {
          const linkName = interaction.options.getString("name");
          const linkUrl = interaction.options.getString("url");

          const foundLink = await Link.findOne({
            guildID: guildId,
            name: linkName,
          });

          if (!foundLink) {
            await Link.create({
              guildID: guildId,
              name: linkName,
              url: linkUrl,
            });
            embed.setDescription(
              "Succesfully saved `" + linkName + "` link to your guild!"
            );
            await interaction.reply({ embeds: [embed], ephemeral: true });
          } else {
            embed.setDescription(
              "`" + linkName + "` link is already saved in your guild!"
            );
            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
          break;
        }

        case "show": {
          const pageNumber = interaction.options.getInteger("page");
          const limitPerPage = 11;
          let currentPageStart = 0;
          let currentPageEnd = limitPerPage;

          const guildLinks = await Link.find({ guildID: guildId });

          const totalPages = Math.ceil(guildLinks.length / limitPerPage);

          if (pageNumber && pageNumber > totalPages) {
            embed.setDescription("Invalid page number!");
            return await interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else if (pageNumber) {
            currentPageStart = pageNumber * limitPerPage - limitPerPage;
            currentPageEnd = currentPageStart + limitPerPage;
          }

          const showLinks = (_currentPageStart, _currentPageEnd) => {
            const currentPageLinks = guildLinks.slice(
              _currentPageStart,
              _currentPageEnd
            );

            return currentPageLinks.map(({ name, url }) => {
              return {
                name: `${name} ⇩`,
                value: url,
              };
            });
          };

          const checkNextBtnState = () => {
            if (currentPageEnd >= guildLinks.length) {
              nextPage.setDisabled(true);
            } else {
              nextPage.setDisabled(false);
            }
          };

          embed
            .setTitle("Links")
            .addFields(showLinks(currentPageStart, currentPageEnd));

          const previousPage = new ButtonBuilder()
            .setCustomId("previousPage")
            .setLabel("Previous Page")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

          const nextPage = new ButtonBuilder()
            .setCustomId("nextPage")
            .setLabel("Next Page")
            .setStyle(ButtonStyle.Primary);

          const embedButtons = new ActionRowBuilder().addComponents(
            previousPage,
            nextPage
          );

          checkNextBtnState();

          const response = await interaction.reply({
            embeds: [embed],
            components: [embedButtons],
          });

          const collectorFilter = (i) => i.user.id === interaction.user.id; // only the user who triggered the original interaction can use the buttons

          const collector = response.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: collectorFilter,
          });

          collector.on("collect", async (_interaction) => {
            // console.log(_interaction);
            const { customId } = _interaction;

            const checkPreviousBtnState = () => {
              if (currentPageStart !== 0) {
                previousPage.setDisabled(false);
              } else {
                previousPage.setDisabled(true);
              }
            };

            switch (customId) {
              case "nextPage": {
                currentPageStart += limitPerPage;
                currentPageEnd += limitPerPage;

                embed.setFields(showLinks(currentPageStart, currentPageEnd));

                checkPreviousBtnState();
                checkNextBtnState();

                await _interaction.update({
                  embeds: [embed],
                  components: [embedButtons],
                });
                break;
              }
              case "previousPage": {
                currentPageStart -= limitPerPage;
                currentPageEnd -= limitPerPage;

                embed.setFields(showLinks(currentPageStart, currentPageEnd));

                checkPreviousBtnState();
                checkNextBtnState();

                await _interaction.update({
                  embeds: [embed],
                  components: [embedButtons],
                });
                break;
              }
            }
          });
          break;
        }

        case "rem": {
          const linkName = interaction.options.getString("name");
          const { deletedCount } = await Link.deleteOne({
            guildID: guildId,
            name: linkName,
          });

          if (deletedCount !== 0) {
            embed.setDescription(
              "Succesfully removed `" + linkName + "` link from your guild!"
            );
          } else {
            embed.setDescription("Link not found in your guild!");
          }
          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }
      }
    } catch (err) {
      console.error(err.message);
      await interaction.reply({ content: err.message, ephemeral: true });
    }
  },
};

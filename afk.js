// const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// const afkModel = require('../../Schemas/afk');

// module.exports = {
// 	data: new SlashCommandBuilder()
// 		.setName('afk')
// 		.setDescription('Toggle your afk status'),
// 	async execute(interaction) {
// 		if (!interaction.guild) {
// 			return interaction.reply({
// 				content: ':x: Slash commands only work on servers',
// 				ephemeral: true,
// 			});
// 		}
// 		const { guildId, user } = interaction;
// 		await afkModel
// 			.findOne({ Guild: guildId, UserID: user.id }, async (err, data) => {
// 				try {
// 					if (err) {
// 						console.log(err);
// 						return;
// 					}
// 					// there is no data for user
// 					if (!data) {
// 						await afkModel.create({
// 							Guild: guildId,
// 							UserID: user.id,
// 							Afk: true,
// 						});
// 					}
// 					// there is data and is afk
// 					else if (data.Afk) {
// 						data.Afk = false;
// 						data.save();
// 						const afkEmbed = new EmbedBuilder()
// 							.setColor(0x41b3a3)
// 							.setDescription('**_You are not afk anymore_**');
// 						return interaction.reply({ embeds: [afkEmbed], ephemeral: true });
// 					}
// 					// if not afk
// 					else {
// 						data.Afk = true;
// 						data.save();
// 					}
// 					const afkEmbed = new EmbedBuilder()
// 						.setColor(0x41b3a3)
// 						.setDescription('**_You are now afk_**');
// 					return interaction.reply({ embeds: [afkEmbed], ephemeral: true });
// 				}
// 				catch (error) {
// 					console.log(error);
// 				}
// 			})
// 			.clone();
// 	},
// };

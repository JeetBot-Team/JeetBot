import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("serverInfo")
		.setDescription("Replies with Server Info!"),
	async execute(interaction: CommandInteraction) {
		console.log({ interaction });
		await interaction.reply(
			`Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`
		);
	},
};

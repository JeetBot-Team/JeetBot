import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("userInfo")
		.setDescription("Replies with User Info!"),
	async execute(interaction: CommandInteraction) {
		console.log({ interaction });
		await interaction.reply(
			`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
		);
	},
};

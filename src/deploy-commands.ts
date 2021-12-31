import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

// Dotenv
import dotenv from "dotenv";
dotenv.config();

const clientId = process.env.TEST_CLIENT_ID || "";
const guildId = process.env.TEST_GUILD_ID || "";
const token = process.env.TEST_BOT_TOKEN || "";

const commands = [
	new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Replies with pong!"),
	new SlashCommandBuilder()
		.setName("server")
		.setDescription("Replies with server info!"),
	new SlashCommandBuilder()
		.setName("user")
		.setDescription("Replies with user info!"),
].map((command) => command.toJSON());

const rest = new REST({ version: "9" }).setToken(token);

rest
	.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log("Successfully registered application commands."))
	.catch(console.error);

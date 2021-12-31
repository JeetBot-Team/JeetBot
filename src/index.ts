// Discord Client
import {
	Client,
	// Collection,
	Intents,
} from "discord.js";
// import fs from 'fs';

// Discord Intents
const myIntents = new Intents();
myIntents.add(
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILDS
);

const client = new Client({ intents: myIntents });

// client.commands = new Collection();
// const commandFiles = fs.readdirSync('../commmands').filter(file => file.endsWith('.ts'))

// for (const file of commandFiles) {
// 	console.log({file})
// }

// Dotenv
import dotenv from "dotenv";
dotenv.config();

// redux store
// const store = require(`./redux/store`);
// const {
//   guildsSelector,
//   guildAdded,
//   guildRemoved,
//   guildDataUpdated,
// } = require(`./redux/guildsSlice`);

// Utils
// const { serverCache, logger, dayjs } = require(`./utils/botUtils`);

// Bot Config
import botConfig from "../bot.config";

client.on("messageCreate", (message) => {
	console.log({ message });

	if (message.author.bot) {
		return;
	}
	if (message.content === "hello") {
		message.channel.send("sup");
	}
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === "ping") {
		await interaction.reply("Pong!");
	} else if (commandName === "server") {
		await interaction.reply(
			`Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`
		);
	} else if (commandName === "user") {
		await interaction.reply(
			`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
		);
	}
});

if (!botConfig.dev) {
	client.login(process.env.BOT_TOKEN);
} else {
	client.login(process.env.TEST_BOT_TOKEN);
}

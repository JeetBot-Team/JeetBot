const Discord = require('discord.js');
require('dotenv').config();

const commandHandler = require('./commands');

const client = new Discord.Client();
const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready To Rock And Roll!');
});

client.on('message', commandHandler);

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(process.env.BOT_TOKEN);
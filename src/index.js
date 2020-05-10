const Discord = require('discord.js');
require('dotenv').config();

const commandHandler = require('./commands');

const client = new Discord.Client();
const cooldowns = new Discord.Collection(); // work on cooldowns later

client.once('ready', () => {
	console.log('Ready To Rock And Roll!');
});

client.on('message', commandHandler);

client.on('message', async message => {

    if(message.author.bot) return;
    if(message.content.toLowerCase() === 'j.listen') {
        
        message.channel.send('Okay! I am listening now...');
        console.log("Listening in: " + message.channel.name);

        let filter = m => !m.author.bot;
		let collector = new Discord.MessageCollector(message.channel, filter);
		let destination = await client.channels.fetch(process.env.SERVER_LOG_ID)
		
        collector.on('collect', (m, col) => {
            console.log("\nChannel: " + message.channel.name + "\nUser: " + m.author.tag + "\nMessage: " + m.content);
            if(destination) {
                if(m.content.toLowerCase() === 'j.stop' && (message.author.id === m.author.id)) {
                    console.log("Stopping collector.");
                    collector.stop();
                }
                else {
                    let embed = new Discord.MessageEmbed()
                        .setTitle(message.channel.name)
                        .setDescription(m.content)
                        .setTimestamp()
                        .setAuthor(m.author.tag, m.author.displayAvatarURL())
                        .setColor('#68a065')

					destination.send(embed);
                }
            }
        });
        collector.on('end', collected => {
            console.log("Messages collected: " + collected.size);
        }); 
	}
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(process.env.BOT_TOKEN);
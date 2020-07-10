// Discord Client
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'REACTION']});

// dotenv
require('dotenv').config();

// MongoDB Info
const database = require('./database/database');
const ServerInfo = require('./database/models/dbdiscordserverinfo');

// Handlers
const commandHandler = require('./commands');

// cooldowns to fix later
const cooldowns = new Discord.Collection(); 

client.once('ready', () => {
    database.then(() => console.log(`${client.user.tag} is connected to MongoDB.`)).catch(err => console.log(err));

    client.guilds.cache.map(async (guild) => {

        let guildInfo = await ServerInfo.findOne({
            server_id: guild.id,
        });

        if(!guildInfo) {
            let serverInfo = new ServerInfo({
                server_id: guild.id,
                server_name: guild.name,
                discord_owner_id: guild.ownerID,
            })
            
            try {
                await serverInfo.save();
                console.log(`${guild.name} has been saved to the Database`);
            } catch {
                err => console.log(err);
            }

        } else {
            console.log(`${guild.name} exists in the Database`);
        }
    });
    
    console.log(`${client.user.tag} has added all the servers he's on to the database.`);
    console.log(`${client.user.tag} is Ready To Rock And Roll!`);
});

/*

    If there is a welcome message at all, and if it's not just don't do anything
    If there is a welcome message, go ahead and do the logic

*/

// Create an event listener for new guild members

client.on('guildMemberAdd', member => {

    console.log(member);

    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
    // Do nothing if the channel wasn't found on this server
    // console.log(member);
    if (!channel) return;
    
    // Send the message, mentioning the member
    channel.send(`Welcome to the Coding Hell Gang ${member}!`);
    channel.send('Please select a role in #announcements by clicking the chef or wow emoji');
});

// client.on('guildMemberAdd', member => {
//     // Send the message to a designated channel on a server:
//     const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
//     // Do nothing if the channel wasn't found on this server
//     // console.log(member);
//     if (!channel) return;
    
//     // Send the message, mentioning the member
//     channel.send(`Welcome to the Coding Hell Gang ${member}!`);
//     channel.send('Please select a role in #announcements by clicking the chef or wow emoji');
// });

const roleSelectMessageId = '708954046207098881';

// Adds a Role to user when user uses reaction on role-select
client.on('messageReactionAdd', async (reaction, user) => {

    let applyRole = async () => {
        let emojiName = reaction.emoji.name;
        let role = reaction.message.guild.roles.cache.find(role => role.name.toLowerCase() === emojiName.toLowerCase());
        let member = reaction.message.guild.members.cache.find(member => member.id === user.id);

        try {
            if(role && member) {
                console.log("Role & Member Found!");
                await member.roles.add(role);
                console.log("Role added to Member!");
            }
        } catch(err) {
            console.log(err);
        }
    }

    if(reaction.message.partial) {
        console.log("A user reacted to an uncached message");
        let reactionMessage = await reaction.message.fetch()
                                .catch(error => {
                                    console.log('Something went wrong when fetching: ', error);
                                });

        console.log(reactionMessage.id, "We got the message fetched");
        if(reactionMessage.id === roleSelectMessageId) {
            console.log("Passed the fetched message, reactionID = roleSelectID");
            applyRole();
        }
    } else {
        console.log("The message is not partial.");
        if(reaction.message.id === roleSelectMessageId) {
            console.log("Reaction Message = Role Message Id");
            applyRole();
        }
      }
});

client.on('message', (message) => {
    if(message.author.bot) return;

    const morningMessage = message.content.toLowerCase();
    
    if(morningMessage === "good morning jeet!") {
        message.channel.send(`Good Morning ${message.author.username}`)
    }
});

client.on('message', (message) => {
    if(message.author.bot) return;

    const morningMessage = message.content.toLowerCase();
    
    if(morningMessage === "jeet i love you!") {
        message.channel.send(`I love you too, ${message.author.username}`)
    }
});

// Command Handler
client.on('message', commandHandler);


// Server Chat Logger
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
                    console.log(m.content);
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

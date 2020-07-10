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

// Create an event listener for new guild members

client.on('guildMemberAdd', async (member) => {

    // console.log(member.guild.id, "<--- this is the guild id");

    let guildInfo = await ServerInfo.findOne({
        server_id: member.guild.id,
    });

    // Send the message to a designated channel on a server:
    const channel = member.guild.channels.cache.find(ch => ch.id === guildInfo.WelcomeMessage.WelcomeChannel);
    // Do nothing if the channel wasn't found on this server
    // console.log(member);
    if (!channel) return;
    
    // Send the message, mentioning the member
    channel.send(guildInfo.WelcomeMessage.MessageInfo);
});



// Adds a Role to user when user uses reaction on role-select
client.on('messageReactionAdd', async (reaction, user) => {

    let applyRole = async (roleMappings) => {

        // console.log(reaction.emoji.id, "<--- reaction emoji id");
        // console.log(typeof reaction.emoji.id, "<-- type of reaction emoji id");
        // console.log(Object.keys(roleMappings[0]), "<--- first key in the rolemappings")

        // let firstKey = Object.keys(roleMappings[0]);

        // console.log(typeof firstKey, "<--- type of first in rolemappings");

        // console.log(reaction.message.guild.roles, "<--- reaction msg guild roles");

        // reaction.emoji.id === roleMappings[0][reaction.emoji.id];

        // console.log("we're in applyRoles");

        let role = undefined;
        //instead of Number, use parseInt(emojiId, 10)
        //OR parseFloat(emojiId)

        for(let i = 0; i < roleMappings.length; i++) {
            let emojiId = Object.keys(roleMappings[i]);
            //console.log(emojiId, "<-- this is emoji ID within the for loop");
            //console.log(parseInt(emojiId, 10), "<--- this is the parseInt emoji ID number");
            if(parseInt(emojiId, 10) === parseInt(reaction.emoji.id, 10)) {
                role = reaction.message.guild.roles.cache.find(role => role.id === roleMappings[i][emojiId]);
                // console.log(role, "this is role inside for loop");
            }
        }
        // console.log(role, "<--- This is the role");
        
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

        console.log(reactionMessage.guild.id, "<--- This is the guild ID");

        let guildInfo = await ServerInfo.findOne({
            server_id: reactionMessage.guild.id,
        });

        let roleSelectMessageId = guildInfo.RoleReactions.Message_ID;

        console.log(roleSelectMessageId, "<--- roleSelectMessageId");
        console.log(reactionMessage.id, "<--- reactionMessage.id");

        console.log(guildInfo.RoleReactions.RoleMappings, "<---- Role Mappings");

        if(reactionMessage.id === roleSelectMessageId) {
            console.log("Passed the fetched message, reactionID = roleSelectID");
            applyRole(guildInfo.RoleReactions.RoleMappings);
        }
    } else {
        console.log("The message is not partial.");

        let guildInfo = await ServerInfo.findOne({
            server_id: reaction.message.channel.guild.id,
        });

        let roleSelectMessageId = guildInfo.RoleReactions.Message_ID;

        if(reaction.message.id === roleSelectMessageId) {
            console.log("Reaction Message = Role Message Id");
            applyRole(guildInfo.RoleReactions.RoleMappings);
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



//no please don't call people tossers
//I mean my brother is hispanic
//idk halee hasn't sent any google hangout or nothign
//OH SHE DID
//go to slack she put it there
//just do it



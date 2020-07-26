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
    
    console.log(`${client.user.tag} is Ready To Rock And Roll!`);
});

// When Jeet joins a new server
client.on('guildCreate', async (guild) => {

    console.log(`Jeet has joined a new Discord server: ${guild.name}`);

    let guildInfo = await ServerInfo.findOne({
        server_id: guild.id,
    });

    if(!guildInfo) {
        
        let serverInfo = new ServerInfo({
            server_id: guild.id,
            server_name: guild.name,
            discord_owner_id: guild.ownerID,
        });
        
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

// Jeet has been kicked off the server
client.on('guildDelete', async (guild) => {

    console.log(`Jeet has been kicked from ${guild.name}`);

    let guildInfo = await ServerInfo.findOne({
        server_id: guild.id,
    });

    if(guildInfo) {
        try {
            await guildInfo.deleteOne();
            console.log(`${guild.name} has been deleted from the Database`);
        } catch {
            err => console.log(err);
        }
    } else {
        console.log(`${guild.name} does not exist in the Database`);
    }
});

// Create an event listener for new guild members
client.on('guildMemberAdd', async (member) => {

    let guildInfo = await ServerInfo.findOne({
        server_id: member.guild.id,
    });

    let channel = member.guild.channels.cache.find(ch => ch.id === guildInfo.WelcomeMessage.WelcomeChannel);
    if (!channel) return;
    
    channel.send(guildInfo.WelcomeMessage.MessageInfo);
});

// Adds a Role to user when user uses reaction on role-select
client.on('messageReactionAdd', async (reaction, user) => {

    let applyRole = async (roleMappings) => {

        let role = undefined;

        for(let i = 0; i < roleMappings.length; i++) {
            let emojiId = Object.keys(roleMappings[i]);
        
            if(parseInt(emojiId, 10) === parseInt(reaction.emoji.id, 10)) {
                role = reaction.message.guild.roles.cache.find(role => role.id === roleMappings[i][emojiId]);
            }
        }
        
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

        let guildInfo = await ServerInfo.findOne({
            server_id: reactionMessage.guild.id,
        });

        let roleSelectMessageId = guildInfo.RoleReactions.Message_ID;

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

// Removes a Role to user when user uses reaction on role-select
client.on('messageReactionRemove', async (reaction, user) => {

    let applyRole = async (roleMappings) => {

        let role = undefined;

        for(let i = 0; i < roleMappings.length; i++) {
            let emojiId = Object.keys(roleMappings[i]);
        
            if(parseInt(emojiId, 10) === parseInt(reaction.emoji.id, 10)) {
                role = reaction.message.guild.roles.cache.find(role => role.id === roleMappings[i][emojiId]);
            }
        }
        
        let member = reaction.message.guild.members.cache.find(member => member.id === user.id);

        try {
            if(role && member) {
                console.log("Role & Member Found!");
                await member.roles.remove(role);
                console.log("Role removed to Member!");
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

        let guildInfo = await ServerInfo.findOne({
            server_id: reactionMessage.guild.id,
        });

        let roleSelectMessageId = guildInfo.RoleReactions.Message_ID;

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

    if(morningMessage === "jeet i love you!") {
        message.channel.send(`I love you too, ${message.author.username}`)
    }
});

// Command Handler
client.on('message', commandHandler);

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(process.env.BOT_TOKEN);

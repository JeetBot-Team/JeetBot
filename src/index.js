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

// local storage
let clientSideStorage = new Map();

// redux store
const store = require('./redux/store');
const { guildsSelector, guildsSlice, guildAdded } = require('./redux/guildsSlice');

// When the bot turns on
// Turn on the connection to DB and retrieve all Discord Servers and their specialized info 
client.once('ready', async () => {
		
  database.then(() => console.log(`${client.user.tag} is connected to MongoDB.`)).catch(err => console.log(err));

		try {
			await Promise.all(client.guilds.cache.map(async (guild) => {

				let guildInfo = await ServerInfo.findOne({
					server_id: guild.id,
				});

				if (!guildInfo) {
					let serverInfo = new ServerInfo({
						server_id: guild.id,
						server_name: guild.name,
						discord_owner_id: guild.ownerID,
					});

					try {
						await serverInfo.save();
						clientSideStorage.set(guild.id, {
							server_id: guild.id,
							server_name: guild.name,
							discord_owner_id: guild.ownerID
						});
						// need to add to Redux store here
						console.log(`${guild.name} has been saved to the Database`);
					}	catch {
							err => console.log(err);
						}
				}	else {					
						clientSideStorage.set(guildInfo.server_id, guildInfo._id);
						console.log(`${guild.name} exists in the Database`);
				}
			}));
		} catch {
				err => console.log(err);
		} finally {
				console.log("*** This is the Store's status ***\n", store.getState());
				console.log(`${client.user.tag} is Ready To Rock And Roll!`);	
		}
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
          clientSideStorage.set(guild.id, {
              server_id: guild.id,
              server_name: guild.name,
              discord_owner_id: guild.ownerID
			});
					// add it to the redux store as well
           console.log(`${guild.name} has been saved to the Database && Redux Store`);
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
						// remove it from the redux store as well
            clientSideStorage.delete(guild.id);
            await guildInfo.deleteOne();
            console.log(`${guild.name} has been deleted from the Database`);
        } catch {
            err => console.log(err);
        }
    } else {
        console.log(`${guild.name} does not exist in the Database`);
    }
});

// An event listener for new guild members
client.on('guildMemberAdd', async (member) => {

		let clientGuildInfo = guildsSelector.selectById(store.getState(), clientSideStorage.get(member.guild.id));
    
    if(clientGuildInfo) {
      if(clientGuildInfo.WelcomeMessage.WelcomeChannel) {
        let channel = member.guild.channels.cache.find(ch => ch.id === clientGuildInfo.WelcomeMessage.WelcomeChannel);
        if (!channel) return;

        channel.send(clientGuildInfo.WelcomeMessage.MessageInfo);
      } else {
      	  return;
      }
    } else {
        console.log(`Jeet cannot find this server ${member.guild.id} in the client side storage.`)
        let guildInfo = await ServerInfo.findOne({
            server_id: member.guild.id,
        });

				clientSideStorage.set(member.guild.id, guildInfo._id);
				// Add to Redux store guildsSelector.selectById(store.getState(), clientSideStorage.get(member.guild.id));
        
        if(guildInfo.WelcomeMessage.WelcomeChannel) {
            let channel = member.guild.channels.cache.find(ch => ch.id === guildInfo.WelcomeMessage.WelcomeChannel);
            if (!channel) return;

            channel.send(guildInfo.WelcomeMessage.MessageInfo);
        } else {
            return;
        }

    }
    
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

// Special Messages and EatRole Handler
client.on('message', async (message) => {
    if(message.author.bot) return;

    const specialMessage = message.content.toLowerCase();
    
    if(specialMessage === "good morning jeet!") {
        message.channel.send(`Good Morning ${message.author.username}`)
     }

    if(specialMessage === "jeet i love you!") {
        message.channel.send(`I love you too, ${message.author.username}`)
		}

    let guildInfo = await ServerInfo.findOne({
        server_id: message.channel.guild.id,
    });

    member = message.guild.members.cache.find(member => member.id === message.author.id);
    role = message.guild.roles.cache.find(role => role.id === guildInfo.EatRole);

    if(member && role) {
      if(member._roles.includes(role.id)) {
          console.log(`${message.author.username} in ${message.channel.guild.name} has a chance to get their messages eaten by Ffej.`);
          let chance = Math.floor(Math.random() * 100) + 1;
          
          if(chance > 0 && chance <= 15) {
            message.delete().then(msg => console.log(`Ffej has deleted message from ${msg.author.username} in Discord Server: ${msg.channel.guild.name}`)).catch(err => console.log(err));
          }
      }  
    }

    let guildInfo = await ServerInfo.findOne({
        server_id: message.channel.guild.id,
    });

    member = message.guild.members.cache.find(member => member.id === message.author.id);
    role = message.guild.roles.cache.find(role => role.id === guildInfo.EatRole);

    if(member && role) {
      if(member._roles.includes(role.id)) {
          console.log(`${message.author.username} in ${message.channel.guild.name} has a chance to get their messages eaten by Ffej.`);
          let chance = Math.floor(Math.random() * 100) + 1;
          
          if(chance > 0 && chance <= 15) {
            message.delete().then(msg => console.log(`Ffej has deleted message from ${msg.author.username} in Discord Server: ${msg.channel.guild.name}`)).catch(err => console.log(err));
          }
      }  
    }
});

// Command Handler
client.on('message', async (msg) => {
    commandHandler(msg, clientSideStorage.get(msg.channel.guild.id), store);
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

client.login(process.env.BOT_TOKEN);

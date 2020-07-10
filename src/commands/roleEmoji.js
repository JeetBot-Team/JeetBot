const Discord = require('discord.js');
const ServerInfo = require('../database/models/dbdiscordserverinfo');

module.exports = async (msg) => {
    
    if(msg.member.hasPermission(['BAN_MEMBERS'])) {
        console.log(`${msg.author.username} can add roles and add emojis from Discord Server: ${msg.guild}`);
        
        // turn on your developer settings in so and so? offer small tutorial.
        msg.channel.send(`${msg.author}, which message would you like to use for your role reactions?\nCopy the ID of the message you want to use.`);
        let filter = m => !m.author.bot;
        let collector = new Discord.MessageCollector(msg.channel, filter);

        collector.on('collect', async (m, col) => {
            console.log("\nChannel: " + msg.channel.name + "\nUser: " + m.author.tag + "\nMessage: " + m.content);
            
            // '731175719937507371' but i want to turn string into a number and check if it's only numbers?????
            // isNaN("48394839") --> false
            // isNaN("dicks") --> true
            if (msg.author.id === m.author.id && !isNaN(m.content)) {
                // try to fetch the message off discord? and if it's not able to fetch tell them it's not the right msg id
                
                let roleEmojiMsgId = m.content.slice(0);

                console.log("roleEmojiMsgId has been collected below", `\n ${roleEmojiMsgId}`);

                msg.channel.send(`${msg.author}, What emoji and role would you like to bind to the message?\n Please enter the emoji you would like to use & tag the role you would like to bind the emoji to.\nYou can only enter one emoji role mapping at a time.\nType in j.stop when you're finished.`);

                let guildInfo = await ServerInfo.findOne({
                    server_id: msg.channel.guild.id,
                });

                guildInfo.RoleReactions.Message_ID = roleEmojiMsgId;

                await guildInfo.save();
            }

            if (msg.author.id === m.author.id && m.content.startsWith("<:")) {
                let roleEmojiMapping = m.content.slice(2, m.content.length-1);
                let emojiID = roleEmojiMapping.slice(roleEmojiMapping.indexOf(":")+1, roleEmojiMapping.indexOf(">"));
                let roleID = roleEmojiMapping.slice(roleEmojiMapping.indexOf("&")+1);

                console.log("This is the Role Emoji Mapping: ", roleEmojiMapping);
                console.log("This is the Emoji ID: ", emojiID);
                console.log("This is the Role ID ", roleID);
                
                msg.channel.send(`I've collected an emoji and role! Type j.stop if you're done, otherwise keep adding roles.`);

                let guildInfo = await ServerInfo.findOne({
                    server_id: msg.channel.guild.id,
                });

                let roleEmojiObj = {
                    [emojiID]: roleID
                }

                if(guildInfo.RoleReactions.RoleMappings) {
                    
                    for(let key in guildInfo.RoleReactions.RoleMappings) {
                        if(guildInfo.RoleReactions.RoleMappings[key] === roleID) {
                            msg.channel.send(`${msg.author}, that role emoji mapping exists! Please enter a new one.`);
                            return;
                        }
                    }
                    
                    guildInfo.RoleReactions.RoleMappings.push(roleEmojiObj);
                } else if (!guildInfo.RoleReactions.RoleMappings) {
                    guildInfo.RoleReactions.RoleMappings = roleEmojiObj;
                }

                try {
                    await guildInfo.save();
                    console.log("We've saved the role emoji into the Database");
                } catch {
                    err => console.log(err);
                }
            }

            if(msg.author.id === m.author.id && m.content.startsWith("j.stop")) {
                msg.channel.send(`${msg.author}, I've stopped collecting role reaction messages.`);
                collector.stop();
            }
        }); 
    } else {
        console.log('This member cannot add emoji role mappings');
        return msg.channel.send(`${msg.author.username} do not have the authority to edit the role emoji mappings`);
    }    
};
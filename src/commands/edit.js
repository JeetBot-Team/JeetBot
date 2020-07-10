/*

This is for editing a welcome message.
User Types: j.edit
Jeetbot responses: what would you like your message to be?
User Types in the welcome message, presses enter.
Jeetbot collects the message. // Jeetbot listens to the user's event in a specific server and specific channel
Jeetbot asks in which channel would you like it to go to?
User responds with a # and channel name "#Welcome"
Jeetbot saves the channel.

Jeetbot sends this information to the database.

*/

const Discord = require('discord.js');
const ServerInfo = require('../database/models/dbdiscordserverinfo');

module.exports = async (msg) => {

    // console.log(msg.channel.guild.id, "this is the guild id");
    
    if(msg.member.hasPermission(['BAN_MEMBERS'])) {
        console.log(`${msg.author.username} can manage messages from Discord Server: ${msg.guild}`);
        
        msg.channel.send(`${msg.author}, what would you like your welcome message to be?`);
        let filter = m => !m.author.bot;
        let collector = new Discord.MessageCollector(msg.channel, filter);

        collector.on('collect', async (m, col) => {
            console.log("\nChannel: " + msg.channel.name + "\nUser: " + m.author.tag + "\nMessage: " + m.content);
            
            if (msg.author.id === m.author.id && m.content.includes("j.end")) {
                let welcomeMsg = m.content.slice(0, m.content.length-5);
                console.log("Welcome Message has been collected below", `\n ${welcomeMsg}`);

                msg.channel.send(`${msg.author}, where would you like the welcome message to go?`);

                let guildInfo = await ServerInfo.findOne({
                    server_id: msg.channel.guild.id,
                });

                guildInfo.WelcomeMessage.MessageInfo = welcomeMsg;

                await guildInfo.save();
            }

            if (msg.author.id === m.author.id && m.content.startsWith("<#")) {
                let channel = m.content.slice(2, m.content.length-1);

                let guildInfo = await ServerInfo.findOne({
                    server_id: msg.channel.guild.id,
                });

                guildInfo.WelcomeMessage.WelcomeChannel = channel;

                await guildInfo.save();

                console.log("Channel has been collected: ", `${channel}`)

                collector.stop();
            }
        }); 
    } else {
        console.log('This member cannot edit the welcome message');
        return msg.channel.send(`${msg.author.username} do not have the authority to edit the welcome message`);
    }    
};
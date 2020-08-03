const Discord = require('discord.js');
const ServerInfo = require('../../database/models/dbdiscordserverinfo');

module.exports = async (msg, args, clientServerInfo) => {
    
    if(msg.member.hasPermission(['MANAGE_ROLES'])) {
        console.log(`${msg.author.username} can manage roles from Discord Server: ${msg.guild}`);
        
        msg.channel.send(`${msg.author}, which role would you like me to send Ffej the 🐈‍ to bully and delete their messages occasionally?\nPlease type your answer in this format: **j.this @role**\nIf you do not want to change the message, type in **j.stop**`);
        let filter = m => !m.author.bot;
        let collector = new Discord.MessageCollector(msg.channel, filter);

        collector.on('collect', async (m, col) => {
            console.log("\nChannel: " + msg.channel.name + "\nUser: " + m.author.tag + "\nMessage: " + m.content);
            
            if (msg.author.id === m.author.id && m.content.includes("j.this")) {
                let roleID = m.content.slice(m.content.indexOf("&")+1, m.content.indexOf(">"));
                console.log("The role Ffej will eat is ", `${roleID}`);

                try {
                    let guildInfo = await ServerInfo.findOne({
                        server_id: msg.channel.guild.id,
                    });

                    guildInfo.EatRole = roleID;

                    await guildInfo.save();
                    
                    clientServerInfo.EatRole = roleID;
                    console.log(clientServerInfo.EatRole, "<-- this is the EatRole within eat.js");
                    msg.channel.send(`${msg.author}, I've told Ffej to bully users with the role you've mentioned.`);
                    
                    collector.stop();
                } catch {
                    err => console.log(err);
                }
            }

            if (msg.author.id === m.author.id && m.content.includes("j.stop")) {
                msg.channel.send(`${msg.author}, I've told Ffej not to change anything.`);
                collector.stop();
            }
        }); 
    } else {
        console.log('This member cannot tell Ffej which role to eat');
        msg.channel.send(`${msg.author.username} does not have the authority to tell Ffej what to do.`);
    }
};
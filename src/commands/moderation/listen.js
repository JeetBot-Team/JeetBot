const Discord = require('discord.js');
const ServerInfo = require('../../database/models/dbdiscordserverinfo');

module.exports = async (msg) => {
    
    if(msg.member.hasPermission(['MANAGE_MESSAGES'])) {
        if(msg.author.bot) return;
        console.log(`${msg.author.username} can manage messages from Discord Server: ${msg.guild}`);

        let filter = m => !m.author.bot;
        let collector = new Discord.MessageCollector(msg.channel, filter);

        let guildInfo = await ServerInfo.findOne({
            server_id: msg.channel.guild.id,
        });

        let destination = undefined;

        if(guildInfo.ListenInfo.channel_ID) {
          destination = await msg.guild.channels.cache.find(ch => ch.id === guildInfo.ListenInfo.channel_ID);
          msg.channel.send(`${msg.author}, I'm listening now to ${msg.channel}.\nIf you want to change where I'm sending messages to, type j.channel #channel`);
        } else if (!guildInfo.ListenInfo.channel_ID) {
            msg.channel.send(`${msg.author}, which channel do you want send listened messages to?\nPlease enter j.channel #channel.`);
        }

        collector.on('collect', async (m, col) => {
            console.log("\nChannel: " + msg.channel.name + "\nUser: " + m.author.tag + "\nMessage: " + m.content);

            if (msg.author.id === m.author.id && m.content.startsWith("j.channel") && !isNaN((m.content.indexOf("#")+1, m.content.length-1))) {
                
                let listen_channelID = m.content.slice(m.content.indexOf("#")+1, m.content.length-1);
                let listen_channelName = m.content.slice(m.content.indexOf("<"), m.content.indexOf(">")+1);

                console.log("Listen Server ID has been collected: ", listen_channelID);

                msg.channel.send(`${msg.author}, Okay! I'll send messages to ${listen_channelName}.\nIf you want to change where I'm sending messages to, type j.channel #channel\nIf you want me to stop listening for messages, type j.done.`);

                let guildInfo = await ServerInfo.findOne({
                    server_id: msg.channel.guild.id,
                });

                guildInfo.ListenInfo.channel_ID = listen_channelID;
                
                await guildInfo.save();
                destination = await msg.guild.channels.cache.find(ch => ch.id === listen_channelID);
            }

            if(destination) {

                if(m.content.toLowerCase() === 'j.done' && (msg.author.id === m.author.id)) {
                    msg.channel.send(`${msg.author}, I'm done listening.`);
                    console.log(`${msg.author} has turned off the message collector in ${msg.guild}`);
                    collector.stop();
                }
                else {
                    let embed = new Discord.MessageEmbed()
                        .setTitle(msg.channel.name)
                        .setDescription(m.content)
                        .setTimestamp()
                        .setAuthor(m.author.tag, m.author.displayAvatarURL())
                        .setColor('#68a065')

                    destination.send(embed);
                }
            }

            if(msg.author.id === m.author.id && m.content.startsWith("j.done")) {
                msg.channel.send(`${msg.author}, I'm done listening.`);
                console.log(`${msg.author} has turned off the message collector in ${msg.guild}`);
                collector.stop();
            }
        }); 
    } else {
        console.log('This member cannot access j.listen.');
        return msg.channel.send(`${msg.author.username} does not have the authority to use j.listen.`);
    }    
};
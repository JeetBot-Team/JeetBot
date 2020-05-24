// Commands
const ping = require('./ping');
const eightBall = require('./8ball');
const serverInfo = require('./serverInfo');
const userInfo = require('./userInfo');
const kick = require('./kick');
const avatar = require('./avatar');
const prune = require('./prune');
const ban = require('./ban');
const mute = require('./mute');
const help = require('./help');
const embed = require('./embed');
const dice = require('./dice');

// Channels
const guildID = process.env.GUILD_ID;
const botChannel = process.env.BOT_CHANNEL_ID;
const generalChannel = process.env.GENERAL_CHANNEL_ID;

// Prefix
const PREFIX = process.env.PREFIX;

const commands = {
    ping, 
    '8ball': eightBall,
    'server': serverInfo,
    'user': userInfo,
    kick,
    avatar,
    prune,
    ban,
    mute,
    help,
    embed,
    dice
};

module.exports = async (msg) => {

    // Sends Commands back to Bot Channel
    if(msg.guild.id === guildID && msg.channel.id === botChannel || 
       msg.guild.id === guildID && msg.channel.id === generalChannel) {
        
        const args = msg.content.split(/ +/); 

        if(args.length === 0 || !args[0].startsWith(PREFIX)) return; 
        const command = args.shift().substr(2); 
        
        if (Object.keys(commands).includes(command)) {
            commands[command](msg, args);
        } 		
    }
 }
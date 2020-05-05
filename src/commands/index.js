const ping = require('./ping');
const eightBall = require('./8ball');
const serverInfo = require('./serverInfo');
const userInfo = require('./userInfo');
const kick = require('./kick');
const avatar = require('./avatar');
const prune = require('./prune');

const guildID = process.env.GUILD_ID;
const botChannel = process.env.CHANNEL_ID;

const commands = {
    ping, 
    '8ball': eightBall,
    'server': serverInfo,
    'user': userInfo,
    kick,
    avatar,
    prune
};

module.exports = async (msg) => {

	if(msg.guild.id === guildID && msg.channel.id === botChannel) {
        
        const args = msg.content.split(/ +/);

        if(args.length === 0 || args[0].charAt(0) !== 'j' || args[0].charAt(1) !== '.') return;
        const command = args.shift().substr(2);
        
        if (Object.keys(commands).includes(command)) {
            commands[command](msg, args);
        } 
		
	}
 }
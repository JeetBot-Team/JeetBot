// Commands

// info commands
const avatar = require('./info/avatar');
const help = require('./info/help');
const ping = require('./info/ping');
const serverInfo = require('./info/serverInfo');
const userInfo = require('./info/userInfo');

// misc commands
const embed = require('./embed');
<<<<<<< HEAD

// fun commands
const dice = require('./fun/dice');
const eightBall = require('./fun/8ball');
const patpat = require('./fun/patpat');

// moderation commands
const ban = require('./moderation/ban');
const eat = require('./moderation/eat');
const edit = require('./moderation/edit');
const kick = require('./moderation/kick');
const listen = require('./moderation/listen');
const mute = require('./moderation/mute');
const prune = require('./moderation/prune');
const roleEmoji = require('./moderation/roleEmoji');

=======
const dice = require('./dice');
const edit = require('./edit');
const roleEmoji = require('./roleEmoji');
const listen = require('./listen');
const eat = require('./eat');
>>>>>>> d9db12820714633389733b45a6316578eb7bdde3

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
    dice,
    edit,
    'roleemoji': roleEmoji,
    listen,
<<<<<<< HEAD
    eat,
    patpat
=======
    eat
>>>>>>> d9db12820714633389733b45a6316578eb7bdde3
};

module.exports = async (msg, serverInfo, store) => {    
    const args = msg.content.split(/ +/); 

    if(args.length === 0 || !args[0].startsWith(PREFIX)) return; 
        const command = args.shift().substr(2); 
        
    if (Object.keys(commands).includes(command)) {
        commands[command](msg, args, serverInfo)
    }
}
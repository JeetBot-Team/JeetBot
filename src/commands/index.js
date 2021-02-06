// Commands

// info commands
const avatar = require(`./info/avatar`);
const help = require(`./info/help`);
const ping = require(`./info/ping`);
const serverInfo = require(`./info/serverInfo`);
const userInfo = require(`./info/userInfo`);

// misc commands
const embed = require(`./misc/embed`);

// fun commands
const dice = require(`./fun/dice`);
const eightBall = require(`./fun/8ball`);
const patpat = require(`./fun/patpat`);

// moderation commands
const ban = require(`./moderation/ban`);
const eat = require(`./moderation/eat`);
const gatekeep = require(`./moderation/gatekeep`);
const kick = require(`./moderation/kick`);
const listen = require(`./moderation/listen`);
const mute = require(`./moderation/mute`);
const prune = require(`./moderation/prune`);
const roleEmoji = require(`./moderation/roleEmoji`);
const serverClock = require(`./moderation/serverClock`);
const welcomeEdit = require(`./moderation/welcomeEdit`);

// Prefix
const PREFIX = process.env.PREFIX;

const commands = {
  ping,
  "8ball": eightBall,
  server: serverInfo,
  user: userInfo,
  kick,
  avatar,
  prune,
  ban,
  mute,
  help,
  embed,
  dice,
  welcomeEdit,
  roleemoji: roleEmoji,
  listen,
  eat,
  patpat,
  clock: serverClock,
  gatekeep,
};

module.exports = async (msg, store) => {
  const args = msg.content.split(/ +/);

  if (args.length === 0 || !args[0].startsWith(PREFIX)) return;

  const command = args.shift().substr(2);

  if (Object.keys(commands).includes(command)) {
    commands[command](msg, args, store);
  }
};

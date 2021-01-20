const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg) => {
  if (msg.member.hasPermission([`KICK_MEMBERS`])) {
    logger.info(
      `${msg.author.username} can kick people from Discord Server: ${msg.guild}`
    );
    if (!msg.mentions.users.size) {
      logger.warn(`Moderator did not tag a user when using kick function`);
      return msg.channel.send(`You need to tag a user in order to kick them!`);
    }

    const taggedUser = msg.mentions.members.first();

    msg.channel.send(`You kicked ${taggedUser.user.username}`);
    taggedUser.kick();

    logger.info(
      `Moderator ${msg.author.username} has kicked ${taggedUser} from ${msg.guild}!`
    );
  } else {
    logger.warn(`This member cannot kick members`);
    return msg.channel.send(
      `${msg.author.username} does not have the authority to kick someone`
    );
  }
};

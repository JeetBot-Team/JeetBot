const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg) => {
  if (msg.member.hasPermission([`BAN_MEMBERS`])) {
    logger.info(
      `${msg.author.username} can ban people from Discord Server: ${msg.guild}`
    );
    if (!msg.mentions.users.size) {
      logger.warn(`Moderator did not tag a user when using ban function`);
      return msg.channel.send(`You need to tag a user in order to ban them!`);
    }

    const taggedUser = msg.mentions.users.first();

    msg.channel.send(`You banned ${taggedUser.username}`);
    msg.guild.members.ban(taggedUser);

    logger.info(
      `Moderator ${msg.author.username} has banned ${taggedUser} from ${msg.guild}!`
    );
  } else {
    logger.warn(`This member cannot ban members`);
    return msg.channel.send(
      `${msg.author.username} do not have the authority to ban someone`
    );
  }
};

const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg) => {
  if (!msg.mentions.users.size) {
    logger.info(`An avatar was summoned!`);
    return msg.channel.send(
      `Your avatar: <${msg.author.displayAvatarURL({
        format: `png`,
        dynamic: true,
      })}>`
    );
  }

  const avatarList = msg.mentions.users.map((user) => {
    return `${user.username}'s avatar: <${user.displayAvatarURL({
      format: `png`,
      dynamic: true,
    })}>`;
  });

  logger.info(`${avatarList.length} avatars were summoned!`);

  msg.channel.send(avatarList);
};

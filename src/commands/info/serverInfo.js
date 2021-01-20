const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg) => {
  await msg.channel.send(
    `This server's name is: ${msg.guild.name}\nTotal Members: ${msg.guild.memberCount}`
  );
  logger.info(`Server Info response sent!`);
};

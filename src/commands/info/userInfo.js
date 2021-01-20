const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg) => {
  await msg.channel.send(
    `Your username: ${msg.author.username}\nYour ID: ${msg.author.id}`
  );
  logger.info(`User Info response sent!`);
};

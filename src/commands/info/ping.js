const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg) => {
  await msg.channel.send(`pong`);
  logger.info(`Ping Pong! (sent)`);
};

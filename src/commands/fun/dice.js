const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg) => {
  const i = Math.floor(Math.random() * 20) + 1;
  await msg.channel.send(`${msg.author} you got this roll: ${i} 🎲`);
  logger.info(`Jeet rolled dice and got: ${i}`);
};

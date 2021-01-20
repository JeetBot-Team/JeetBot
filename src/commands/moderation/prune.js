const { logger } = require(`../../utils/botUtils`);

module.exports = async (msg, args) => {
  if (msg.member.hasPermission([`MANAGE_MESSAGES`])) {
    logger.info(
      `${msg.author.username} can prune messages from Discord Server: ${msg.guild}`
    );

    const amount = parseInt(args[0]) + 1;

    if (isNaN(amount)) {
      logger.warn(`Tried to Prune stuff but not valid!`);
      return msg.channel.send(`That doesn't seem to be a valid number.`);
    } else if (amount <= 1 || amount > 100) {
      logger.warn(`Tried to Prune stuff but number is too high or low`);
      return msg.channel.send(`You need to input a number between 1 and 99.`);
    }

    logger.info(`Pruned ${amount} number of messages!`);

    msg.channel.bulkDelete(amount, true).catch((err) => {
      logger.error(err);
      msg.channel.send(
        `There was an error trying to prune messages in this channel!`
      );
    });
  } else {
    logger.warn(
      `${msg.author.username} cannot prune messages from Discord Server: ${msg.guild}`
    );
    return msg.channel.send(
      `${msg.author.username} does not have the authority to prune messages from the server`
    );
  }
};

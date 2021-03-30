const { logger } = require(`../../utils/botUtils`);
const Discord = require(`discord.js`);

module.exports = async (msg, args) => {
  msg.channel.bulkDelete(1, true).catch((err) => {
    logger.error(err);
    msg.channel.send(
      `There was an error trying to delete the last message in this channel!`
    );
  });

  let embed = new Discord.MessageEmbed()
    .setTitle(msg.channel.name)
    .setDescription(args.slice().join(` `))
    .setTimestamp()
    .setAuthor(msg.author.tag, msg.author.displayAvatarURL())
    .setColor(`#68a065`);

  logger.info(`An embed message was created`);

  await msg.channel.send(embed);
};

const { logger } = require(`../../utils/botUtils`);
const Discord = require(`discord.js`);

module.exports = async (msg) => {
  msg.channel.bulkDelete(1, true).catch((err) => {
    logger.error(err);
    msg.channel.send(
      `There was an error trying to delete the last message in this channel!`
    );
  });

  let helpAnnouncement = `Here is a list of Jeet commands you can use.`;

  let embed = new Discord.MessageEmbed()
    .setTitle(`Help Commands`)
    .setDescription(helpAnnouncement)
    .addField(
      `j.8ball [question]`,
      `I will answer one of your questions in yes/no fashion`,
      false
    )
    .addField(`j.dice`, `Rolls a 20-sized die and gives you a number`, false)
    .addField(
      `j.patpat [@person]`,
      `Jeet tells the @person a supportive message`,
      false
    )
    .addField(`j.avatar @person`, `Summons the person's picture avatar`, false)
    .addField(`j.ping`, `pong`, false)
    .addField(`j.server`, `Grabs the server info for you`, false)
    .addField(`j.user`, `Grabs info about yourself`, false)
    .addField(
      `j.embed [message]`,
      `I'll create a special message for you`,
      false
    )
    .setTimestamp()
    .setColor(`#68a065`);

  await msg.channel.send(embed);
};

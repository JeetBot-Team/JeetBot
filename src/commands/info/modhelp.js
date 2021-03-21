const { logger } = require(`../../utils/botUtils`);
const Discord = require(`discord.js`);

module.exports = async (msg) => {
  msg.channel.bulkDelete(1, true).catch((err) => {
    logger.error(err);
    msg.channel.send(
      `There was an error trying to delete the last message in this channel!`
    );
  });

  if (msg.member.hasPermission([`KICK_MEMBERS`])) {
    let helpAnnouncement = `Here is a list of Jeet Mod commands you can use.`;

    let embed = new Discord.MessageEmbed()
      .setTitle(`Moderation Commands`)
      .setDescription(helpAnnouncement)
      .addField(`j.ban [@person]`, `This will ban a user`, false)
      .addField(
        `j.eat`,
        `Sets a role that Jeetbot will send his cat Ffej to eat all their messages`,
        false
      )
      .addField(
        `j.gatekeep`,
        `Sets up a channel where users have to agree to a message before gaining a role to gain access to other rooms`,
        false
      )
      .addField(`j.kick [@person]`, `Kicks a person from the server`, false)
      .addField(
        `j.listen`,
        `Listens in on a channel and sends back messages from that particular channel`,
        false
      )
      .addField(`j.mute [@person]`, `Mutes a user from speaking`, false)
      .addField(
        `j.prune`,
        `Deletes a mass number of messages, can delete from 1-100 at a time`,
        false
      )
      .addField(
        `j.roleEmoji`,
        `Allows you to give roles to users when they react to certain messages with emojis`,
        false
      )
      .addField(
        `j.clock`,
        `Allows you to create a clock on your discord server to be showed to everyone`,
        false
      )
      .addField(
        `j.welcomeEdit`,
        `Sets up a welcome message when users enter the server`,
        false
      )
      .setTimestamp()
      .setColor(`#68a065`);

    await msg.channel.send(embed);
  }
};

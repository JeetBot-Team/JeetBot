const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { guildDataUpdated } = require(`../../redux/guildsSlice`);
const { serverCache, logger } = require(`../../utils/botUtils`);

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission([`MANAGE_ROLES`])) {
    logger.info(
      `${msg.author.username} can manage roles from Discord Server: ${msg.guild}`
    );

    msg.channel.send(
      `${msg.author}, which role would you like me to send Ffej the 🐈‍ to bully and delete their messages occasionally?\nPlease type your answer in this format: **j.this @role**\nIf you do not want to change the message, type in **j.stop**`
    );
    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      logger.info(
        `\nChannel: ${msg.channel.name}\nUser: ${m.author.tag}\nMessage: ${m.content}`
      );

      if (msg.author.id === m.author.id && m.content.includes(`j.this`)) {
        let roleID = undefined;
        const regex = /([<@&\d>])+/;
        roleID = m.content.match(regex);

        if (roleID) {
          roleID = roleID[0].slice(3, roleID[0].length - 1);
        } else {
          logger.error(`Incorrect input after j.this`);
          msg.channel.send(
            `${msg.author}, you've entered incorrect input after j.this. Please enter a valid role.\nPlease type your answer in this format: **j.this @role**\nIf you do not want to change the message, type in **j.stop**`
          );
          return;
        }

        const role = m.guild.roles.cache.find((role) => role.id === roleID);

        if (role) {
          logger.info(
            `The role Ffej will eat is ${role.name} with an ID: ${role.id}`
          );

          try {
            let guildInfo = await ServerInfo.findOne({
              server_id: msg.channel.guild.id,
            });

            guildInfo.EatRole = roleID;
            await guildInfo.save();
            store.dispatch(guildDataUpdated(serverCache(guildInfo)));

            msg.channel.send(
              `${msg.author}, I've told Ffej to bully users with the ${role.name} role you've mentioned.`
            );

            collector.stop();
          } catch (err) {
            logger.error(err);
          }
        } else {
          logger.error(`Role does not exist`);
          msg.channel.send(
            `${msg.author}, That is not a valid role on your server. Please enter a valid role.\nPlease type your answer in this format: **j.this @role**\nIf you do not want to change the message, type in **j.stop**`
          );
        }
      }

      if (msg.author.id === m.author.id && m.content.includes(`j.stop`)) {
        msg.channel.send(
          `${msg.author}, I've told Ffej not to change anything.`
        );
        collector.stop();
      }
    });
  } else {
    logger.warn(`This member cannot tell Ffej which role to eat`);
    msg.channel.send(
      `${msg.author.username} does not have the authority to tell Ffej what to do.`
    );
  }
};

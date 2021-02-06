const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { serverCache, logger } = require(`../../utils/botUtils`);
const { guildDataUpdated, guildsSelector } = require(`../../redux/guildsSlice`);

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission([`MANAGE_ROLES`])) {
    logger.info(
      `${msg.author.username} can add roles and remove roles from Discord Server: ${msg.guild}`
    );

    // should double check if there's existing gatekeep info
    // should give user more options later

    msg.channel.send(
      `${msg.author}, what channel would you like to keep an eye on? Type in the channel name\n(Don't forget to end your welcome message with j.end)\nIf you would like to exit without making changes, type j.exit`
    );

    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      logger.info(
        `\nChannel: ${msg.channel.name}\nUser: ${m.author.tag}\nMessage: ${m.content}`
      );

      if (
        msg.author.id === m.author.id &&
        m.content.startsWith(`<#`) &&
        m.content.includes(`j.end`)
      ) {
        let channel;
        const regex = /([<#\d>])+/;
        channel = m.content.match(regex);

        logger.info({ channel });

        if (channel[0].includes(`<#`)) {
          channel = channel[0].slice(2, channel[0].length - 1);
          // note to revamp later
        } else {
          logger.error(`Cannot find channel`);
          msg.channel.send(
            `${msg.author}, you've entered an incorrect channel name. Please enter a valid channel.`
          );
          return;
        }

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.gatekeeper.channel_ID = channel;
        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        logger.info(`Channel has been collected: ${channel}`);
        msg.channel.send(
          `${msg.author}, Please enter what the passcode should be. Type j.messageEnd when you're done`
        );
      }

      if (msg.author.id === m.author.id && m.content.includes(`j.messageEnd`)) {
        let passcode = m.content
          .slice()
          .replace(/( j.messageEnd|j.messageEnd)/g, ``);
        logger.info(`\n** passcode has been collected **\n ${passcode}`);

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.gatekeeper.passcode = passcode;

        await guildInfo.save();

        store.dispatch(guildDataUpdated(serverCache(guildInfo)));
        msg.channel.send(
          `${msg.author}, Please let me know what role I should add. Type j.roleCollect when you're done`
        );
      }

      if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.roleCollect`)
      ) {
        const regex = /([(<@&|:)\d>])+/g;
        let roleMapping = m.content.match(regex);

        logger.info(roleMapping);

        let roleID = roleMapping[0].slice(3, roleMapping[0].length - 1);

        // do validation checks
        if (roleID) {
          // do a role ID check
        } else {
          logger.error(`Invalid input for roleID`);
          msg.channel.send(
            `${msg.author}, the emoji entered was not recognized.\nPlease follow this format: @role j.roleCollect`
          );
          return;
        }

        logger.info(
          `\nThis is the Role ID Mapping: ${roleMapping}\nThis is the Role ID: ${roleID}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.gatekeeper.role_bind = roleID;

        try {
          await guildInfo.save();
          store.dispatch(guildDataUpdated(serverCache(guildInfo)));
          logger.info(`We've saved the role ID to watch into the Database`);
          msg.channel.send(
            `${msg.author}, Thanks! I saved all the information I needed`
          );
        } catch (err) {
          logger.error(err);
        }
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`j.exit`)) {
        msg.channel.send(
          `${msg.author}, I made no changes as you've requested`
        );
        collector.stop();
      }
    });
  } else {
    logger.warn(
      `${msg.author.username} from ${msg.guild} cannot add a gatekeeper`
    );
    return msg.channel.send(
      `${msg.author.username} does not have the authority to edit the role emoji mappings`
    );
  }
};

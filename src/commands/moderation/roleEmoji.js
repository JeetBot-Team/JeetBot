const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { guildDataUpdated } = require(`../../redux/guildsSlice`);
const { serverCache, logger } = require(`../../utils/botUtils`);

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission([`MANAGE_ROLES`])) {
    logger.info(
      `${msg.author.username} can add roles and add emojis from Discord Server: ${msg.guild}`
    );

    msg.channel.send(
      `${msg.author}, which message would you like to use for your role reactions?\nCopy the ID of the message you want to use.`
    );
    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      logger.info(
        `\nChannel: ${msg.channel.name}\nUser: ${m.author.tag}\nMessage: ${m.content}`
      );

      if (msg.author.id === m.author.id && !isNaN(m.content)) {
        const regex = /([<\d>])+/;
        let roleEmojiMsgId;
        roleEmojiMsgId = m.content.match(regex);
        // ask user to enter channel id where the message is
        // ask user to enter message id

        // should fetch for message to see if it exists
        // can do a validation here to check if it's an actual message
        // check for partials

        if (roleEmojiMsgId) {
          roleEmojiMsgId = roleEmojiMsgId[0];
        } else {
          logger.error(`Message was not found`);
          msg.channel.send(
            `${msg.author}, your entry was invalid.\nPlease enter the message ID (it should contain only numbers)`
          );
          return;
        }

        logger.info(
          `roleEmojiMsgId has been collected below\n ${roleEmojiMsgId}`
        );

        msg.channel.send(
          `${msg.author}, What emoji and role would you like to bind to the message?\n Please enter the emoji you would like to use & tag the role you would like to bind the emoji to.\nYou can only enter one emoji role mapping at a time.\nType in j.stop when you're finished.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.RoleReactions.Message_ID = roleEmojiMsgId;

        store.dispatch(guildDataUpdated(serverCache(guildInfo)));
        await guildInfo.save();
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`<:`)) {
        const regex = /([(<@&|:)\d>])+/g;
        let roleEmojiMapping = m.content.match(regex);

        logger.info(roleEmojiMapping);

        let emojiID = roleEmojiMapping[1].slice(
          1,
          roleEmojiMapping[1].length - 1
        );
        let roleID = roleEmojiMapping[2].slice(
          3,
          roleEmojiMapping[2].length - 1
        );

        // do validation checks
        if (emojiID) {
          // do a emoji ID check
        } else {
          logger.error(`Invalid input for emojiID`);
          msg.channel.send(
            `${msg.author}, the emoji entered was not recognized.\nPlease follow this format: emoji @role`
          );
          return;
        }

        if (roleID) {
          // do a role ID check
        } else {
          logger.error(`Invalid input for roleID`);
          msg.channel.send(
            `${msg.author}, the emoji entered was not recognized.\nPlease follow this format: emoji @role`
          );
          return;
        }

        logger.info(
          `\nThis is the Role Emoji Mapping: ${roleEmojiMapping}\nThis is the Emoji ID: ${emojiID}\nThis is the Role ID: ${roleID}`
        );

        msg.channel.send(
          `I've collected an emoji and role! Type **j.stop** if you're done, otherwise keep adding roles.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        let roleEmojiObj = {
          [emojiID]: roleID,
        };

        // redo this search through objects
        if (guildInfo.RoleReactions.RoleMappings) {
          for (let key in guildInfo.RoleReactions.RoleMappings) {
            if (guildInfo.RoleReactions.RoleMappings[key] === roleID) {
              msg.channel.send(
                `${msg.author}, that role emoji mapping exists! Please enter a new one.`
              );
              return;
            }
          }

          guildInfo.RoleReactions.RoleMappings.push(roleEmojiObj);
        } else if (!guildInfo.RoleReactions.RoleMappings) {
          guildInfo.RoleReactions.RoleMappings = roleEmojiObj;
        }

        try {
          await guildInfo.save();
          store.dispatch(guildDataUpdated(serverCache(guildInfo)));
          logger.info(`We've saved the role emoji into the Database`);
        } catch (err) {
          logger.error(err);
        }
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`j.stop`)) {
        msg.channel.send(
          `${msg.author}, I've stopped collecting role reaction messages.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        store.dispatch(guildDataUpdated(serverCache(guildInfo)));
        collector.stop();
      }
    });
  } else {
    logger.warn(`This member cannot add emoji role mappings`);
    return msg.channel.send(
      `${msg.author.username} does not have the authority to edit the role emoji mappings`
    );
  }
};

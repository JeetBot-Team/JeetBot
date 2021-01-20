const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { guildDataUpdated, guildsSelector } = require(`../../redux/guildsSlice`);
const { serverCache, logger } = require(`../../utils/botUtils`);

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission([`MANAGE_MESSAGES`])) {
    logger.info(
      `${msg.author.username} can manage messages from Discord Server: ${msg.guild}`
    );

    let clientGuildInfo = guildsSelector.selectById(
      store.getState(),
      msg.guild.id
    );

    let guildWelcomeMessage = undefined;

    if (clientGuildInfo.WelcomeMessage) {
      guildWelcomeMessage = clientGuildInfo.WelcomeMessage;
      msg.channel.send(
        `${msg.author}, you have an existing welcome message for the Discord Server.\nWould you like to edit the following settings:\nj.editMessage - Welcome Message Edit\nj.editChannel - Welcome Channel Edit\nj.editBoth - Edits the Welcome Message & Channel`
      );
    } else {
      msg.channel.send(
        `${msg.author}, what would you like your welcome message to be?\n(Don't forget to end your welcome message with j.end)`
      );
    }

    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      logger.info(
        `\nChannel: ${msg.channel.name}\nUser: ${m.author.tag}\nMessage: ${m.content}`
      );

      if (msg.author.id === m.author.id && m.content.includes(`j.editBoth`)) {
        msg.channel.send(
          `${msg.author}, what would you like your welcome message to be?\n(Don't forget to end your welcome message with j.end)`
        );
      } else if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.editMessage`)
      ) {
        msg.channel.send(
          `${msg.author}, what would you like your welcome message to be?\n(Don't forget to end your welcome message with j.messageEnd)`
        );
      } else if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.editChannel`)
      ) {
        msg.channel.send(
          `${msg.author}, where would you like the welcome message to go? Please enter the channel name only`
        );
      }

      if (msg.author.id === m.author.id && m.content.includes(`j.end`)) {
        let welcomeMsg = m.content.slice(0, m.content.length - 5);
        logger.info(
          `\n** Welcome Message has been collected below**\n ${welcomeMsg}`
        );

        msg.channel.send(
          `${msg.author}, where would you like the welcome message to go?`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.WelcomeMessage.MessageInfo = welcomeMsg;

        await guildInfo.save();

        store.dispatch(guildDataUpdated(serverCache(guildInfo)));
      }

      if (msg.author.id === m.author && m.content.includes(`j.messageEnd`)) {
        let welcomeMsg = m.content.slice(0, m.content.length - 5);
        logger.info(
          `\n** Welcome Message has been collected below**\n ${welcomeMsg}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.WelcomeMessage.MessageInfo = welcomeMsg;
        await guildInfo.save();

        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        logger.info(`Channel has been collected: ${channel}`);
        msg.channel.send(`${msg.author}, Thanks I'll remember that!`);
        collector.stop();
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`<#`)) {
        let channel = m.content.slice(2, m.content.length - 1);

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.WelcomeMessage.WelcomeChannel = channel;
        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        logger.info(`Channel has been collected: ${channel}`);
        msg.channel.send(`${msg.author}, Thanks I'll remember that!`);
        collector.stop();
      }
    });
  } else {
    logger.warn(`This member cannot edit the welcome message`);
    msg.channel.send(
      `${msg.author.username} does not have the authority to edit the welcome message`
    );
  }
};

// edge cases

const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { serverCache, logger } = require(`../../utils/botUtils`);
const { guildDataUpdated, guildsSelector } = require(`../../redux/guildsSlice`);

// Setting timezone
const dayjs = require(`dayjs`);
const utc = require(`dayjs/plugin/utc`); // dependent on utc plugin
const timezone = require(`dayjs/plugin/timezone`);
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission([`BAN_MEMBERS`])) {
    logger.info(
      `${msg.author.username} can ban members from Discord Server: ${msg.guild}`
    );

    let clientGuildInfo = guildsSelector.selectById(
      store.getState(),
      msg.guild.id
    );
    let newChannelInfo = undefined;

    if (clientGuildInfo.server_clock) {
      newChannelInfo = clientGuildInfo.server_clock;
      logger.info(`${msg.guild} has an existing server clock`);
    }
    // if they have a server clock already made,
    // tell them that moving forward will reset all the settings

    msg.channel.send(
      `${msg.author}, Please enter the channel name for your server clock.\nType in j.channelName at the end of your sentence to confirm to the next part.\nIf you want to exit without making changes, type j.exit`
    );

    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      logger.info(
        `\nChannel: ${msg.channel.name}\nUser: ${m.author.tag}\nMessage: ${m.content}`
      );

      if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.channelName`)
      ) {
        let channelName = m.content
          .slice()
          .replace(/( j.channelName|j.channelName)/g, ``);

        logger.info(
          `\n** Channel Name has been collected below**\n ${channelName}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        // make channel here
        if (!newChannelInfo) {
          newChannelInfo = await m.guild.channels.create(`${channelName}`, {
            type: `text`,
          });
        } else if (newChannelInfo.channel_ID) {
          // change the existing clock channel name
          // find the channel using channel_ID
          let channel = m.guild.channels.cache.get(newChannelInfo.channel_ID);
          await channel.edit({ name: `${channelName}` });
          logger.info(
            `Server Clock Channel Name in ${msg.guild} has been changed`
          );
        }

        guildInfo.server_clock.channel_ID =
          newChannelInfo.id || newChannelInfo.channel_ID;
        guildInfo.server_clock.channel_name = channelName;

        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        msg.channel.send(
          `${msg.author}, Please enter the title of your server clock.\nType in j.clockTitle at the end of your sentence to confirm to the next part.`
        );
      }

      if (msg.author.id === m.author.id && m.content.includes(`j.clockTitle`)) {
        let clockTitle = m.content
          .slice()
          .replace(/( j.clockTitle|j.clockTitle)/g, ``);

        logger.info(
          `\n** Clock Title has been collected below**\n ${clockTitle}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.embed_message.title = clockTitle;
        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        // ask for next option
        msg.channel.send(
          `${msg.author}, Please enter a description for your server clock.\nType in j.clockDescription at the end of your sentence to confirm to the next part`
        );
      }

      if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.clockDescription`)
      ) {
        let clockDescription = m.content
          .slice()
          .replace(/( j.clockDescription|j.clockDescription)/g, ``);

        logger.info(
          `\n** Clock Title has been collected below**\n ${clockDescription}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.embed_message.description = clockDescription;
        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        // ask for next option
        msg.channel.send(
          `${msg.author}, Please enter a hex color for the left side border color.\nType in j.clockColor at the end of your sentence to confirm to the next part`
        );
      }

      if (msg.author.id === m.author.id && m.content.includes(`j.clockColor`)) {
        let clockColor = m.content
          .slice()
          .replace(/( j.clockColor|j.clockColor)/g, ``);

        logger.info(
          `\n** Clock Color has been collected below**\n ${clockColor}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.embed_message.color = clockColor;
        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        // ask for next option
        msg.channel.send(
          `${msg.author}, Please enter a url link for the image.\nType in j.clockImage at the end of your sentence to confirm to the next part`
        );
      }

      if (msg.author.id === m.author.id && m.content.includes(`j.clockImage`)) {
        let clockImage = m.content
          .slice()
          .replace(/( j.clockImage|j.clockImage)/g, ``);

        logger.info(
          `\n** Clock Image has been collected below**\n ${clockImage}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.embed_message.img_url = clockImage;
        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        // ask for next option
        msg.channel.send(
          `${msg.author}, Please enter the timezone you wish your clock to be set in?\nPlease enter the time zone with the continent/major city such as "America/New_York"\nType in "j.entry" at the beginning then the time zone.`
        );
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`j.entry`)) {
        let timeZoneSetting = m.content
          .slice()
          .replace(/(j.entry |j.entry)/g, ``);
        let testClock;

        try {
          testClock = dayjs().tz(timeZoneSetting);
        } catch (err) {
          return m.channel.send(
            `${m.author}, that is not a correct format for time zones.\nPlease enter the time zone with the continent/major city such as "America/New_York" without quotes`
          );
        }

        logger.info(`timeZoneSetting has been collected: ${timeZoneSetting}`);

        // parse the clock time
        const clock = dayjs().tz(timeZoneSetting).format(`hh:mm A`);

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.timezone = timeZoneSetting;
        guildInfo.server_clock.last_recorded_time = `${clock}`;

        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        msg.channel.send(
          `${msg.author}, Please enter any additional fields that you would like to keep track of?\nType in the time in military time, and the message in [ ]\nEnd your message with j.clockFields`
        );
      }

      if (
        msg.author.id === m.author.id &&
        m.content.startsWith(`j.clockFields`)
      ) {
        // let msg = `22:30[Daily Reset will occur ]j.clockFields`
        let hour = m.content.slice(0, 1);
        let minutes = m.content.slice(3, 4);
        let fieldMsg = m.content.slice(
          m.content.indexOf(`[`),
          m.content.indexOf(`]`)
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        let time = `${hour}:${minutes}`;

        let fieldsObj = {
          [time]: fieldMsg,
        };

        if (guildInfo.server_clock.embed_message.fields) {
          for (let key in guildInfo.server_clock.embed_message.fields) {
            if (guildInfo.server_clock.embed_message.fields[key] === time) {
              msg.channel.send(
                `${msg.author}, that field mapping exists! Please enter a new one.`
              );
              return;
            }
          }

          guildInfo.server_clock.embed_message.fields.push(fieldsObj);
        } else if (!guildInfo.server_clock.embed_message.fields) {
          guildInfo.server_clock.embed_message.fields = fieldsObj;
        }

        try {
          await guildInfo.save();
          store.dispatch(guildDataUpdated(serverCache(guildInfo)));
          logger.info(`We've saved the fields mapping into the Database`);
        } catch (err) {
          logger.error(err);
        }

        msg.channel.send(
          `${msg.author}, Enter in more fields with the previous syntax.\nIf you're finished, type j.clockDone`
        );
      }

      if (
        msg.author.id === m.author.id &&
        m.content.startsWith(`j.clockDone`)
      ) {
        msg.channel.send(
          `${msg.author}, thanks! I made the changes you've requested. The clock is set at the top of the server channels`
        );
        logger.info(`Clock creation is done, collector stopped`);
        collector.stop();
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`j.exit`)) {
        msg.channel.send(
          `${msg.author}, I made no changes as you've requested`
        );
        collector.stop();
      }
    });
  } else {
    logger.warn(`This member cannot create a server clock`);
    return msg.channel.send(
      `${msg.author.username} does not have the authority to create a server clock`
    );
  }
};

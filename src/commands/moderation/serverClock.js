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
    // allow them to change the timezone for that otherwise create a new voice channel for it

    // need to set title and fields here
    // space to attach image
    // give options to set fields

    // ask user to set title
    // set a particular

    // setTimeStamp
    // set a specific color via hex

    // when setting up a new embed message

    msg.channel.send(
      `${msg.author}, Please enter the title of your server clock.\nType in j.clockTitle at the end of your sentence to confirm to the next part`
    );

    // msg.channel.send(
    //   `${msg.author}, Please enter the timezone you wish your clock to be set in?\nPlease enter the time zone with the continent/major city such as "America/New_York"\nType in "j.entry" at the beginning then the time zone.\nIf you want to exit without making changes, type j.exit`
    // );

    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      logger.info(
        `\nChannel: ${msg.channel.name}\nUser: ${m.author.tag}\nMessage: ${m.content}`
      );

      if (msg.author.id === m.author.id && m.content.includes(`j.clockTitle`)) {
        // regex here

        try {
          // try to grab clockTitle
        } catch (err) {
          // if can't grab the clockTitle, send error message and return
        }

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        // save into database
        // ask for next option
        // make sure to end the description with j.clockDescription
      }

      if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.clockDescription`)
      ) {
        // regex here

        try {
          // set the description
        } catch (err) {
          // if can't grab the dsecription, send error message and return
        }

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        // save into database
        // ask for next option
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`j.entry`)) {
        // give options and validate
        // write down the choices they have for date/time
        // if it can't be converted properly, force them to return

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

        if (!newChannelInfo) {
          newChannelInfo = await m.guild.channels.create(
            `Server Time: ${clock}`,
            {
              type: `voice`,
              userLimit: 0,
            }
          );
        } else if (newChannelInfo.channel_ID) {
          // change the existing server clock
          // find the channel using channel_ID
          let channel = m.guild.channels.cache.get(newChannelInfo.channel_ID);
          await channel.edit({ name: `Server Time: ${clock}` });
          logger.info(`clock in ${msg.guild} changed timezones`);
        }

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.timezone = timeZoneSetting;
        guildInfo.server_clock.channel_ID =
          newChannelInfo.id || newChannelInfo.channel_ID;
        guildInfo.server_clock.last_recorded_time = `Server Time: ${clock}`;

        store.dispatch(guildDataUpdated(serverCache(guildInfo)));
        await guildInfo.save();

        msg.channel.send(
          `${msg.author}, thanks! I made the changes you've requested. The clock is set at the top of the server channels`
        );
        logger.info(`Task done, collector stopped`);
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

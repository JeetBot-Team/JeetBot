const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { serverCache } = require(`../../utils/botUtils`);
const { guildDataUpdated, guildsSelector } = require(`../../redux/guildsSlice`);

// Setting timezone
const dayjs = require(`dayjs`);
const utc = require(`dayjs/plugin/utc`); // dependent on utc plugin
const timezone = require(`dayjs/plugin/timezone`);
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = async (msg, args, store) => {
  if (msg.member.hasPermission([`BAN_MEMBERS`])) {
    console.log(
      `${msg.author.username} can ban members from Discord Server: ${msg.guild}`
    );

    let clientGuildInfo = guildsSelector.selectById(
      store.getState(),
      msg.guild.id
    );
    let newChannelInfo = undefined;

    if (clientGuildInfo.server_clock) {
      newChannelInfo = clientGuildInfo.server_clock;
      console.log(`${msg.guild} has an existing server clock`);
    }
    // if they have a server clock already made,
    // allow them to change the timezone for that otherwise create a new voice channel for it

    msg.channel.send(
      `${msg.author}, Please enter the timezone you wish your clock to be set in?\nPlease enter the time zone with the continent/major city such as "America/New_York"\nType in "j.entry" at the beginning then the time zone.\nIf you want to exit without making changes, type j.exit`
    );

    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      console.log(
        `\nChannel: ` +
          msg.channel.name +
          `\nUser: ` +
          m.author.tag +
          `\nMessage: ` +
          m.content
      );

      if (msg.author.id === m.author.id && m.content.startsWith(`j.entry`)) {
        // use regex later
        let timeZoneSetting = m.content.slice(8);
        let testClock;

        try {
          testClock = dayjs().tz(timeZoneSetting);
        } catch (err) {
          return m.channel.send(
            `${m.author}, that is not a correct format for time zones.\nPlease enter the time zone with the continent/major city such as "America/New_York" without quotes`
          );
        }

        console.log(
          `timeZoneSetting has been collected: `,
          `${timeZoneSetting}`
        );

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
          console.log({ id: newChannelInfo.id });
        } else if (newChannelInfo.channel_ID) {
          // change the existing server clock
          // find the channel using channel_ID
          let channel = m.guild.channels.cache.get(newChannelInfo.channel_ID);
          await channel.edit({ name: `Server Time: ${clock}` });
          console.log(`clock in ${msg.guild} changed timezones`);
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
        console.log(`Task done, collector stopped`);
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
    console.log(`This member cannot create a server clock`);
    return msg.channel.send(
      `${msg.author.username} does not have the authority to create a server clock`
    );
  }
};

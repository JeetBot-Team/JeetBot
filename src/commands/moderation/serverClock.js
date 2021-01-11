const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { serverCache } = require(`../../utils/botUtils`);
const { guildServerClockUpdated } = require(`../../redux/guildsSlice`);

// Setting timezone
const dayjs = require(`dayjs`);
const utc = require(`dayjs/plugin/utc`); // dependent on utc plugin
const timezone = require(`dayjs/plugin/timezone`);
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = async (msg, args, store) => {
  // ask user to make a voice channel
  // then ask for the time zone, make this in UTC or something? i don't know
  // in index.js do a check every minute
  if (msg.member.hasPermission([`BAN_MEMBERS`])) {
    console.log(
      `${msg.author.username} can ban members from Discord Server: ${msg.guild}`
    );

    msg.channel.send(
      `${msg.author}, Please enter the timezone you wish your clock to be set in?\n Please enter the time zone in caps like "EST" or the country like "Japan" or "America/New_York"\nType in "j.entry" at the end when you're finished.\nIf you want to exit without making changes, type j.exit`
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

      // const now = dayjs()
      const japanNow = dayjs().tz(`Japan`);
      const estNow = dayjs().tz(`America/New_York`);
      // console.log(now)
      console.log({ japanTime: japanNow });
      console.log({ estTime: estNow });

      if (
        msg.author.id === m.author.id &&
        !isNaN(m.content) &&
        m.content.includes(`j.entry`)
      ) {
        let timeZoneSetting = m.content.slice(0, m.content.indexOf(`j.entry`));

        // test if they entered a proper time zone
        // if not exit out

        // if they have a server clock already made,
        // allow them to change the timezone for that otherwise create a new voice channel for it

        console.log(
          `timeZoneSetting has been collected below`,
          `\n ${timeZoneSetting}`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.timezone = timeZoneSetting;

        store.dispatch(guildServerClockUpdated(serverCache(guildInfo)));
        await guildInfo.save();
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

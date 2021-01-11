const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { serverCache } = require(`../../utils/botUtils`);
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
      `${msg.author}, Please set the timezone you would like the clock to be in`
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

      if (msg.author.id === m.author.id && !isNaN(m.content)) {
        let serverClockChannelId = m.content.slice(0);

        console.log(
          `serverClockChannelId has been collected below`,
          `\n ${serverClockChannelId}`
        );

        msg.channel.send(
          `${msg.author}, Please enter the timezone you wish your clock to be set in?\n Please enter the time zone in caps like "EST"\nType in j.stop when you're finished.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.channel_ID = serverClockChannelId;

        store.dispatch(guildRoleEmojiUpdated(serverCache(guildInfo)));
        await guildInfo.save();
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`<:`)) {
        let roleEmojiMapping = m.content.slice(2, m.content.length - 1);
        let emojiID = roleEmojiMapping.slice(
          roleEmojiMapping.indexOf(`:`) + 1,
          roleEmojiMapping.indexOf(`>`)
        );
        let roleID = roleEmojiMapping.slice(roleEmojiMapping.indexOf(`&`) + 1);

        console.log(`This is the Role Emoji Mapping: `, roleEmojiMapping);
        console.log(`This is the Emoji ID: `, emojiID);
        console.log(`This is the Role ID `, roleID);

        msg.channel.send(
          `I've collected an emoji and role! Type j.stop if you're done, otherwise keep adding roles.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        let roleEmojiObj = {
          [emojiID]: roleID,
        };

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
          console.log(`We've saved the role emoji into the Database`);
        } catch (err) {
          console.log(err);
        }
      }

      if (msg.author.id === m.author.id && m.content.startsWith(`j.stop`)) {
        msg.channel.send(
          `${msg.author}, I've stopped collecting role reaction messages.`
        );

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        store.dispatch(guildRoleEmojiUpdated(serverCache(guildInfo)));
        collector.stop();
      }
    });
  } else {
    console.log(`This member cannot add emoji role mappings`);
    return msg.channel.send(
      `${msg.author.username} does not have the authority to edit the role emoji mappings`
    );
  }
};

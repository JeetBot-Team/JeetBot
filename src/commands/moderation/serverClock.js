const Discord = require(`discord.js`);
const ServerInfo = require(`../../database/models/dbdiscordserverinfo`);
const { serverCache, logger, dayjs } = require(`../../utils/botUtils`);
const { guildDataUpdated, guildsSelector } = require(`../../redux/guildsSlice`);

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
      `${msg.author}, Please enter the category name for your server clock.\nType in j.categoryName at the end of your sentence to confirm to the next part.\nIf you want to exit without making changes, type j.exit`
    );

    let filter = (m) => !m.author.bot;
    let collector = new Discord.MessageCollector(msg.channel, filter);

    collector.on(`collect`, async (m, col) => {
      logger.info(
        `\nChannel: ${msg.channel.name}\nUser: ${m.author.tag}\nMessage: ${m.content}`
      );

      if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.categoryName`)
      ) {
        let categoryName = m.content
          .slice()
          .replace(/( j.categoryName|j.categoryName)/g, ``);

        logger.info(
          `\n** Category Name has been collected below**\n ${categoryName}`
        );

        let newCategory = await m.guild.channels.create(`${categoryName}`, {
          type: `category`,
        });

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.category_ID = newCategory.id;
        guildInfo.server_clock.category_name = categoryName;
        guildInfo.server_clock.isActive = false;

        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        msg.channel.send(
          `${msg.author}, Please enter the channel name for your server clock.\nType in j.channelName at the end of your sentence to confirm to the next part.`
        );
      }

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

        logger.info({ categoryID: guildInfo.server_clock.category_ID });

        // make channel here
        // if (!newChannelInfo) {
        let newChannel = await m.guild.channels.create(`${channelName}`, {
          type: `text`,
          parent: guildInfo.server_clock.category_ID,
        });

        // let category = await m.channels.cache.find(category => category.name == `${guildInfo.server_clock.category_name}` && category.type == 'category')

        // newChannel.setParent(category.id)
        // newChannel.setParent(guildInfo.server_clock.category_ID)
        // } else if (newChannelInfo.channel_ID) {
        // change the existing clock channel name
        // find the channel using channel_ID
        //   let channel = m.guild.channels.cache.get(newChannelInfo.channel_ID);
        //   await channel.edit({ name: `${channelName}` });
        //   logger.info(
        //     `Server Clock Channel Name in ${msg.guild} has been changed`
        //   );
        // }

        guildInfo.server_clock.channel_ID =
          newChannel.id || newChannelInfo.channel_ID;
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
        const clock = dayjs().tz(timeZoneSetting).format(`ddd hh:mm A z`);

        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        guildInfo.server_clock.timezone = timeZoneSetting;
        guildInfo.server_clock.last_recorded_time = `${clock}`;

        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

        msg.channel.send(
          `${msg.author}, Please enter any additional fields that you would like to keep track of?\nType in the time in military time, and type your first message in [ ], and your second message within { }\nEnd your message with j.clockFields\nSample Input: 09:00[Daily Reset occurs at]{• Includes Daily Gacha and Login Bonus}j.clockFields`
        );
      }

      if (
        msg.author.id === m.author.id &&
        m.content.includes(`j.clockFields`)
      ) {
        let hour = m.content.slice(0, 2);
        let minutes = m.content.slice(3, 5);
        let fieldMsg = [
          m.content.slice(m.content.indexOf(`[`) + 1, m.content.indexOf(`]`)),
          m.content.slice(m.content.indexOf(`{`) + 1, m.content.indexOf(`}`)),
        ];

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

      if (msg.author.id === m.author.id && m.content.includes(`j.clockDone`)) {
        msg.channel.send(
          `${msg.author}, thanks! I made the changes you've requested. The clock is set at the top of the server channels`
        );

        // send the embed message here
        let guildInfo = await ServerInfo.findOne({
          server_id: msg.channel.guild.id,
        });

        // set the clock setting to true
        // do initial time clock calculation

        const clock = dayjs()
          .tz(guildInfo.server_clock.timezone)
          .format(`ddd hh:mm A z`);

        // convert timezone to readable three letter word?

        let embed = new Discord.MessageEmbed()
          .setTitle(guildInfo.server_clock.embed_message.title)
          .setDescription(guildInfo.server_clock.embed_message.description)
          .setTimestamp()
          .setColor(guildInfo.server_clock.embed_message.color)
          .setImage(guildInfo.server_clock.embed_message.img_url)
          .addField(
            `Clock 🕒`,
            `\`\`\`md
# ${clock}
\`\`\``,
            false
          );

        // also add timezone calculation to the second entry in the fields area
        for (const field of guildInfo.server_clock.embed_message.fields) {
          // do some time calculation here, place it within the embed
          const fieldHeader = field[Object.keys(field)][0];
          const fieldText = field[Object.keys(field)][1];

          let time = Object.keys(field).toString();
          let hour = time.slice(0, 2);
          let minutes = time.slice(3, 5);

          if (
            dayjs().isAfter(
              dayjs.tz(
                `${hour}:${minutes}`,
                `HH:mm`,
                `${guildInfo.server_clock.timezone}`
              )
            )
          ) {
            let futureDate = dayjs
              .tz(
                `${hour}:${minutes}`,
                `HH:mm`,
                `${guildInfo.server_clock.timezone}`
              )
              .add(1, `day`);
            embed.addField(
              `${fieldHeader} ${dayjs().to(futureDate)}`,
              `${fieldText}`,
              false
            );
          } else {
            embed.addField(
              `${fieldHeader} ${dayjs()
                .tz(`${guildInfo.server_clock.timezone}`)
                .to(
                  dayjs.tz(
                    `${hour}:${minutes}`,
                    `HH:mm`,
                    `${guildInfo.server_clock.timezone}`
                  )
                )}`,
              `${fieldText}`,
              false
            );
          }
        }

        let destination = await m.guild.channels.cache.find(
          (ch) => ch.id === guildInfo.server_clock.channel_ID
        );
        let messageEmbed = await destination.send(embed);

        logger.info({ messageEmbed });

        // save the id of the message embed
        guildInfo.server_clock.embed_message.id = messageEmbed.id;
        guildInfo.server_clock.isActive = true;
        await guildInfo.save();
        store.dispatch(guildDataUpdated(serverCache(guildInfo)));

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

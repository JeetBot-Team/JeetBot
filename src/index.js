// Discord Client
const Discord = require(`discord.js`);
const client = new Discord.Client({ partials: [`MESSAGE`, `REACTION`] });

// dotenv
require(`dotenv`).config();

// MongoDB Info
const database = require(`./database/database`);
const ServerInfo = require(`./database/models/dbdiscordserverinfo`);

// Handlers
const commandHandler = require(`./commands`);

// cooldowns to fix later
const cooldowns = new Discord.Collection();

// redux store
const store = require(`./redux/store`);
const {
  guildsSelector,
  guildAdded,
  guildRemoved,
  guildDataUpdated,
} = require(`./redux/guildsSlice`);

// Utils
const { serverCache, logger } = require(`./utils/botUtils`);

// Date/Time
const dayjs = require(`dayjs`);
const utc = require(`dayjs/plugin/utc`); // dependent on utc plugin
const timezone = require(`dayjs/plugin/timezone`);
dayjs.extend(utc);
dayjs.extend(timezone);

// When the bot turns on
// Turn on the connection to DB and retrieve all Discord Servers and their specialized info
client.once(`ready`, async () => {
  database
    .then(() => logger.info(`${client.user.tag} is connected to MongoDB.`))
    .catch((err) => logger.error(err));

  try {
    await Promise.all(
      client.guilds.cache.map(async (guild) => {
        let guildInfo = await ServerInfo.findOne({
          server_id: guild.id,
        });

        if (!guildInfo) {
          let serverInfo = new ServerInfo({
            server_id: guild.id,
            server_name: guild.name,
            discord_owner_id: guild.ownerID,
          });

          try {
            await serverInfo.save();
            store.dispatch(guildAdded(serverCache(guildInfo)));
            logger.info(
              `${guild.name} has been saved to the Database & to the Redux Store`
            );
          } catch (err) {
            logger.error(err);
          }
        } else {
          store.dispatch(guildAdded(serverCache(guildInfo)));
          logger.info(
            `${guild.name} exists in the Database & has been added to Redux Store`
          );
        }
      })
    );
  } catch (err) {
    logger.error(err);
  } finally {
    logger.info(`*** This is the Store's status ***\n`, store.getState());
    logger.info(`${client.user.tag} is Ready To Rock And Roll!`);
  }
});

// When Jeet joins a new server
client.on(`guildCreate`, async (guild) => {
  logger.info(`Jeet has joined a new Discord server: ${guild.name}`);

  let guildInfo = await ServerInfo.findOne({
    server_id: guild.id,
  });

  if (!guildInfo) {
    let serverInfo = new ServerInfo({
      server_id: guild.id,
      server_name: guild.name,
      discord_owner_id: guild.ownerID,
    });

    try {
      await serverInfo.save();
      store.dispatch(guildAdded(serverCache(serverInfo)));
      logger.info(
        `${guild.name} has been saved to the Database && Redux Store`
      );
    } catch (err) {
      logger.error(err);
    }
  } else {
    logger.info(`${guild.name} exists in the Database`);
  }
});

// Jeet has been kicked off the server
client.on(`guildDelete`, async (guild) => {
  logger.info(`Jeet has been kicked from ${guild.name}`);

  let guildInfo = await ServerInfo.findOne({
    server_id: guild.id,
  });

  if (guildInfo) {
    try {
      store.dispatch(guildRemoved(serverCache(guildInfo)));
      await guildInfo.deleteOne();
      logger.info(`${guild.name} has been deleted from the Database`);
    } catch (err) {
      logger.error(err);
    }
  } else {
    logger.info(`${guild.name} does not exist in the Database`);
  }
});

// An event listener for new guild members
client.on(`guildMemberAdd`, async (member) => {
  let clientGuildInfo = guildsSelector.selectById(
    store.getState(),
    member.guild.id
  );

  if (clientGuildInfo) {
    if (clientGuildInfo.WelcomeMessage.WelcomeChannel) {
      let channel = member.guild.channels.cache.find(
        (ch) => ch.id === clientGuildInfo.WelcomeMessage.WelcomeChannel
      );
      if (!channel) return;

      channel.send(clientGuildInfo.WelcomeMessage.MessageInfo);
    } else {
      return;
    }
  } else {
    logger.info(
      `Jeet cannot find this server ${member.guild.id} in the client side storage.\nJeet will fetch this server and add it to the Redux Store.`
    );

    let guildInfo = await ServerInfo.findOne({
      server_id: member.guild.id,
    });

    store.dispatch(guildAdded(serverCache(guildInfo)));

    if (guildInfo.WelcomeMessage.WelcomeChannel) {
      let channel = member.guild.channels.cache.find(
        (ch) => ch.id === guildInfo.WelcomeMessage.WelcomeChannel
      );
      if (!channel) return;

      channel.send(guildInfo.WelcomeMessage.MessageInfo);
    } else {
      return;
    }
  }
});

// Adds a Role to user when user uses reaction on role-select
client.on(`messageReactionAdd`, async (reaction, user) => {
  let applyRole = async (roleMappings) => {
    let role = undefined;

    for (let i = 0; i < roleMappings.length; i++) {
      let emojiId = Object.keys(roleMappings[i]);

      if (parseInt(emojiId, 10) === parseInt(reaction.emoji.id, 10)) {
        role = reaction.message.guild.roles.cache.find(
          (role) => role.id === roleMappings[i][emojiId]
        );
      }
    }

    let member = reaction.message.guild.members.cache.find(
      (member) => member.id === user.id
    );

    try {
      if (role && member) {
        logger.info(`Role & Member Found!`);
        await member.roles.add(role);
        logger.info(`Role added to Member!`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  if (reaction.message.partial) {
    let reactionMessage = await reaction.message.fetch().catch((error) => {
      logger.error(
        `Something went wrong when fetching a partial message: `,
        error
      );
    });

    let guildInfo = guildsSelector.selectById(
      store.getState(),
      reactionMessage.guild.id
    );

    let roleSelectMessageId = guildInfo.RoleReactions.Message_ID;

    if (reactionMessage.id === roleSelectMessageId) {
      logger.info(
        `Someone reacted to a message\nFetched the Partial Message & reactionID = roleSelectID`
      );
      applyRole(guildInfo.RoleReactions.RoleMappings);
    }
  } else {
    let guildInfo = guildsSelector.selectById(
      store.getState(),
      reaction.message.channel.guild.id
    );
    let roleSelectMessageId = guildInfo.RoleReactions.Message_ID;

    if (reaction.message.id === roleSelectMessageId) {
      logger.info(
        `Someone reacted to a message\nThe message was not partial\nReaction Message = Role Message Id`
      );
      applyRole(guildInfo.RoleReactions.RoleMappings);
    }
  }
});

// Special Messages and EatRole Handler
client.on(`message`, async (message) => {
  if (message.author.bot) return;

  const specialMessage = message.content.toLowerCase();

  if (specialMessage === `good morning jeet!`) {
    message.channel.send(`Good Morning ${message.author.username}`);
  }

  if (specialMessage === `jeet i love you!`) {
    message.channel.send(`I love you too, ${message.author.username}`);
  }

  if (
    specialMessage === `j.test` &&
    message.author.id === `427702166640263169`
  ) {
    let test = guildsSelector.selectById(
      store.getState(),
      message.channel.guild.id
    );
    logger.info(`*** This is the Guild Info You Requested ***\n`, test);
  }

  let guildInfo = guildsSelector.selectById(
    store.getState(),
    message.channel.guild.id
  );

  member = message.guild.members.cache.find(
    (member) => member.id === message.author.id
  );
  role = message.guild.roles.cache.find(
    (role) => role.id === guildInfo.EatRole
  );

  if (member && role) {
    if (member._roles.includes(role.id)) {
      logger.info(
        `${message.author.username} in ${message.channel.guild.name} has a chance to get their messages eaten by Ffej.`
      );
      let chance = Math.floor(Math.random() * 100) + 1;

      if (chance > 0 && chance <= 50) {
        message
          .delete()
          .then((msg) =>
            logger.info(
              `Ffej has deleted message from ${msg.author.username} in Discord Server: ${msg.channel.guild.name}`
            )
          )
          .catch((err) => logger.error(err));
      }
    }
  }

  // clock settings
  if (guildInfo.server_clock) {
    // make date object, compare that to the last recorded time
    const clock = dayjs().tz(guildInfo.server_clock.timezone).format(`hh:mm A`);
    let currentTime = `Server Time: ${clock}`;

    // if time is different, change time
    if (currentTime != guildInfo.server_clock.last_recorded_time) {
      // change the time
      logger.info({ currentTime });
      logger.info({
        "before change clock": guildInfo.server_clock.last_recorded_time,
      });

      let guildInfoToUpdate = await ServerInfo.findOne({
        server_id: message.channel.guild.id,
      });
      guildInfoToUpdate.server_clock.last_recorded_time = currentTime;
      logger.info({
        "after change clock": guildInfoToUpdate.server_clock.last_recorded_time,
      });
      // save it to the store
      store.dispatch(guildDataUpdated(serverCache(guildInfoToUpdate)));
      // find channel
      let channel = await message.guild.channels.cache.get(
        guildInfo.server_clock.channel_ID
      );
      // change time on clock
      await channel.edit({ name: currentTime });
    } else {
      logger.info(`Time doesn't need to be changed`);
    }
  }
});

// Command Handler
client.on(`message`, async (msg) => {
  commandHandler(msg, store);
});

process.on(`unhandledRejection`, (error) => {
  console.error(`Unhandled promise rejection:`, error);
});

client.login(process.env.BOT_TOKEN);

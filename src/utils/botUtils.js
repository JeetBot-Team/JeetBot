const { dev } = require(`../../bot.config`);

const pino = require(`pino`);
const logger = pino({
  prettyPrint: dev ? true : false,
  timestamp: false,
});

// Takes in a Discord Guild and changes the server_id to ._id for local cache
const serverCache = (guild) => {
  let newGuildInfo = JSON.parse(JSON.stringify(guild));
  newGuildInfo._id = newGuildInfo.server_id;
  return newGuildInfo;
};

module.exports = {
  serverCache,
  logger,
};

const { dev } = require(`../../bot.config`);

const dayjs = require(`dayjs`);
const customParseFormat = require(`dayjs/plugin/customParseFormat`);
const utc = require(`dayjs/plugin/utc`);
const timezone = require(`dayjs/plugin/timezone`);
const relativeTime = require(`dayjs/plugin/relativeTime`);
const advancedFormat = require(`dayjs/plugin/advancedFormat`);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);

// Logger
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
  dayjs,
  serverCache,
  logger,
};

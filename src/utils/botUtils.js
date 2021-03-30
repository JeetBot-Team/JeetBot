const { dev } = require(`../../bot.config`);

// Date/Time

const dayjs = require(`dayjs`);
const customParseFormat = require(`dayjs/plugin/customParseFormat`);
const utc = require(`dayjs/plugin/utc`);
const timezone = require(`dayjs/plugin/timezone`);
const relativeTime = require(`dayjs/plugin/relativeTime`);
const advancedFormat = require(`dayjs/plugin/advancedFormat`);
const updateLocale = require(`dayjs/plugin/updateLocale`);

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);

const config = {
  thresholds: [
    { l: `s`, r: 1 },
    { l: `m`, r: 1 },
    { l: `mm`, r: 59, d: `minute` },
    { l: `h`, r: 1 },
    { l: `hh`, r: 23, d: `hour` },
    { l: `d`, r: 1 },
    { l: `dd`, r: 29, d: `day` },
    { l: `M`, r: 1 },
    { l: `MM`, r: 11, d: `month` },
    { l: `y` },
    { l: `yy`, d: `year` },
  ],
};

dayjs.extend(relativeTime, config);

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

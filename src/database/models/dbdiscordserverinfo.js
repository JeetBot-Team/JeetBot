const mongoose = require(`mongoose`);

const DiscordServerInfoSchema = new mongoose.Schema({
  server_id: {
    type: String,
  },
  server_name: {
    type: String,
  },
  discord_owner_id: {
    type: Number,
  },
  discord_username: {
    type: String,
  },
  discord_user_token: {
    type: String,
  },
  last_login: {
    type: String,
  },
  ListenInfo: {
    channel_ID: String,
  },
  RoleReactions: {
    Message_ID: String,
    RoleMappings: {
      type: [mongoose.Schema.Types.Mixed],
    },
  },
  gatekeeper: {
    channel_ID: String,
    passcode: String,
    role_watch: String,
    role_add: String,
  },
  WelcomeMessage: {
    MessageInfo: {
      type: String,
    },
    WelcomeChannel: {
      type: String,
    },
  },
  EatRole: {
    type: String,
  },
  server_clock: {
    channel_ID: {
      type: String,
    },
    timezone: {
      type: String,
    },
    last_recorded_time: {
      type: String,
    },
  },
});

const DiscordServerInfoModel = (module.exports = mongoose.model(
  `DiscordServerInfo`,
  DiscordServerInfoSchema
));

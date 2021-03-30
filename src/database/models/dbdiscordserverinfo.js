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
    category_name: {
      type: String,
    },
    category_ID: {
      type: String,
    },
    channel_ID: {
      type: String,
    },
    channel_name: {
      type: String,
    },
    timezone: {
      type: String,
    },
    last_recorded_time: {
      type: String,
    },
    embed_message: {
      title: String,
      description: String,
      color: String,
      img_url: String,
      fields: {
        type: [mongoose.Schema.Types.Mixed],
      },
      id: String,
    },
    isActive: Boolean,
  },
});

const DiscordServerInfoModel = (module.exports = mongoose.model(
  `DiscordServerInfo`,
  DiscordServerInfoSchema
));

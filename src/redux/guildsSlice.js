const { createSlice, createEntityAdapter } = require(`@reduxjs/toolkit`);

const guildsAdapter = createEntityAdapter();
const guildsSelector = guildsAdapter.getSelectors((state) => state.guilds);

const selectId = (instance) => {
  return instance._id;
};

const guildsSlice = createSlice({
  name: `guilds`,
  initialState: guildsAdapter.getInitialState(),
  reducers: {
    guildAdded(state, action) {
      const id = selectId(action.payload);
      action.payload.id = id;
      guildsAdapter.addOne(state, action.payload);
    },
    guildRemoved(state, action) {
      const id = selectId(action.payload);
      action.payload.id = id;
      guildsAdapter.removeOne(state, action.payload);
    },
    guildEatRoleUpdated(state, action) {
      const { _id, EatRole } = action.payload;
      const guild = state.entities[_id];
      if (guild) {
        guild.EatRole = EatRole;
      }
    },
    guildWelcomeMessageUpdated(state, action) {
      const { _id, WelcomeMessage } = action.payload;
      const guild = state.entities[_id];
      if (guild) {
        if (guild.WelcomeMessage.MessageInfo !== WelcomeMessage.MessageInfo) {
          guild.WelcomeMessage.MessageInfo = WelcomeMessage.MessageInfo;
        }

        if (
          guild.WelcomeMessage.WelcomeChannel !== WelcomeMessage.WelcomeChannel
        ) {
          guild.WelcomeMessage.WelcomeChannel = WelcomeMessage.WelcomeChannel;
        }
      }
    },
    guildRoleEmojiUpdated(state, action) {
      const { _id, RoleReactions } = action.payload;
      const guild = state.entities[_id];
      if (guild) {
        if (guild.RoleReactions.Message_ID !== RoleReactions.Message_ID) {
          guild.RoleReactions.Message_ID = RoleReactions.Message_ID;
        }

        if (
          JSON.stringify(guild.RoleReactions.RoleMappings) !==
          JSON.stringify(RoleReactions.RoleMappings)
        ) {
          guild.RoleReactions.RoleMappings = RoleReactions.RoleMappings;
        }
      }
    },
    guildServerClockUpdated(state, action) {
      const { _id, server_clock } = action.payload;
      const guild = state.entities[_id];

      if (guild) {
        if (guild.server_clock !== server_clock) {
          guild.server_clock = server_clock;
        }
      }
    },
    // guildListenInfoUpdated(state, action) {
    // },
  },
});

const {
  guildAdded,
  guildRemoved,
  guildEatRoleUpdated,
  guildWelcomeMessageUpdated,
  guildRoleEmojiUpdated,
  guildServerClockUpdated,
  // guildListenInfoUpdated,
} = guildsSlice.actions;

module.exports = {
  guildsSelector,
  guildsSlice,
  guildAdded,
  guildRemoved,
  guildEatRoleUpdated,
  guildWelcomeMessageUpdated,
  guildRoleEmojiUpdated,
  guildServerClockUpdated,
  // guildListenInfoUpdated,
};

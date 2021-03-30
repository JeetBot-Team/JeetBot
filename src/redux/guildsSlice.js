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
    guildDataUpdated(state, action) {
      const id = selectId(action.payload);
      action.payload.id = id;
      const guild = state.entities[id];

      if (guild) {
        guildsAdapter.upsertOne(state, action.payload);
      }
    },
    // guildListenInfoUpdated(state, action) {
    // },
  },
});

const {
  guildAdded,
  guildRemoved,
  guildDataUpdated,
  // guildListenInfoUpdated,
} = guildsSlice.actions;

module.exports = {
  guildsSelector,
  guildsSlice,
  guildAdded,
  guildRemoved,
  guildDataUpdated,
  // guildListenInfoUpdated,
};

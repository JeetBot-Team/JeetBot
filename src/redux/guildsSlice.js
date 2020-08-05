const { createSlice, createEntityAdapter, createAsyncThunk } = require('@reduxjs/toolkit');

// const database = require('../database/database');
const ServerInfo = require('../database/models/dbdiscordserverinfo');

const guildsAdapter = createEntityAdapter();

const guildsSelector = guildsAdapter.getSelectors(state => state.guilds)

const fetchAllGuilds = createAsyncThunk(
    'guilds/fetchAllGuilds', 
    async (arg, thunkAPI) => {
      const response = await ServerInfo.find({});
      if(response) {
        thunkAPI.dispatch(guildsSlice.actions.guildsLoaded(response));
        return response;
      } else {
        return;
      }
    }
);

const guildsSlice = createSlice({
    name: 'guilds',
    initialState: guildsAdapter.getInitialState(),
    reducers: {
      guildAdded(state, action) {
        // console.log("we're here in guildAdded");
        guildsAdapter.addOne(state, action.payload);
      },
      guildsLoaded(state, action) {
        guildsAdapter.setAll(state, action.payload);
      },
      guildRemoved(state, action) {
        guildsAdapter.removeOne(state, action.payload);
      },
      guildEatUpdated(state, action) {
        const {id, value} = action.payload;
        const guild = state.entities[id];
        if(guild) {
          guild.eat_updated = value;
        }
      },
    },
    extraReducers: {
      [fetchAllGuilds.fulfilled]: (state, action) => {
        console.log("The function fetchAllGuilds has been fulfilled");
      },
      // [fetchOneGuild.fulfilled]: (state, action) => {
      //   console.log("*** This is the state in fetchOneGuilds.fulfilled ***\n", state);
      //   console.log("*** This is the action in fetchOneGuilds.fulfilled ***\n", action);
      //   // state.entities.push(action.payload)
      // }
    }
});

const {
    guildAdded,
    guildsLoaded,
    guildRemoved,
} = guildsSlice.actions

module.exports = {
    guildsSelector,
    guildsSlice,
    fetchAllGuilds,
    guildAdded,
    guildsLoaded,
    guildRemoved
}


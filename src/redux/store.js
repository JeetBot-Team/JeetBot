const { createSlice, 
        createAsyncThunk, 
        createEntityAdapter, 
        configureStore,
        getDefaultMiddleware } = require('@reduxjs/toolkit');

const database = require('../database/database');
const ServerInfo = require('../database/models/dbdiscordserverinfo');

const guildsAdapter = createEntityAdapter();

const guildSelectors = guildsAdapter.getSelectors(state => state.guilds)

const selectAllGuilds = state => state.guilds;
const selectGuildById = (state, guildId) => {
  state.guilds.find(guild => guild.id === guildId);

} 

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

const fetchOneGuild = createAsyncThunk(
  'guilds/fetchOneGuild', 
  async (guildId) => {
    const response = await ServerInfo.find({
      server_id: guildId
    });
    console.log(response, "this is the response under guild/fetchOneGuild")
    return response;
  }
)

const guildsSlice = createSlice({
  name: 'guilds',
  initialState: guildsAdapter.getInitialState(),
  reducers: {
    guildAdded(state, action) {
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
    }
  },
  extraReducers: {
    [fetchAllGuilds.fulfilled]: (state, action) => {
      console.log("The function fetchAllGuilds has been fulfilled");
    },
    [fetchOneGuild.fulfilled]: (state, action) => {
      console.log("*** This is the state in fetchOneGuilds.fulfilled ***\n", state);
      console.log("*** This is the action in fetchOneGuilds.fulfilled ***\n", action);
      // state.entities.push(action.payload)
    }
  }
})

module.exports = configureStore({
  reducer: {
   guilds: guildsSlice.reducer
  },
  middleware: getDefaultMiddleware().concat(fetchAllGuilds, fetchOneGuild),
  devTools: false,
})
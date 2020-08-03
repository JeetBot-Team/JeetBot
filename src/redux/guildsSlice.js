// const { createSlice, createAsyncThunk, createEntityAdapter } = require('@reduxjs/toolkit');

// const database = require('./database/database');
// const ServerInfo = require('./database/models/dbdiscordserverinfo');

// const guildsAdapter = createEntityAdapter();

// export const selectAllGuilds = state => state.guildsAdapter
// export const selectGuildById = (state, guildId) => state.guilds.find(guild => guild.id === guildId)

// database.then(() => console.log("We're connecting to the DB from GuildsSlice")).catch(err => console.log(err));

// const fetchAllGuilds = createAsyncThunk(
//   'guilds/fetchAllGuilds', 
//   async () => {
//     const response = await ServerInfo.find({});
//     console.log(response, "this is the response under guild/fetchAllGuilds");  
//     return response;
//   }
// );

// const fetchOneGuild = createAsyncThunk(
//   'guilds/fetchOneGuild', 
//   async (guildId) => {
//     const response = await ServerInfo.find({
//       server_id: guildId
//     });
//     console.log(response, "this is the response under guild/fetchOneGuild")
//     return response;
//   }
// )

// export const guildsSlice = createSlice({
//   name: 'guilds',
//   initialState: guildsAdapter.getInitialState(),
//   reducers: {
//     guildAdded: guildsAdapter.addOne,
//     guildsLoaded(state, action) {
//       guildsAdapter.setAll(state, action.payload);
//     },
//     guildEatUpdated(state, action) {
//       const {id, value} = action.payload;
//       const guild = state.entities[id];
//       if(guild) {
//         guild.eat_updated = value;
//       }
//     }
//   },
//   extraReducers: {
//     [fetchAllGuilds.fulfilled]: (state, action) => {
//       state.entities.push(action.payload);
//     },
//     [fetchOneGuild.fulfilled]: (state, action) => {
//       state.entities.push(action.payload)
//     }
//   }
// })

// export const { guildAdded, guildsLoaded, guildEatUpdated } = guildsSlice.actions;

// export default guildsSlice.reducer;

// export const {
//   selectAll: selectAllGuilds,
//   selectById: selectGuildById,
// } = guildsAdapter.getSelectors(state => state.guilds)

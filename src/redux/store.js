const { configureStore, getDefaultMiddleware } = require('@reduxjs/toolkit');
const { guildsSlice, fetchAllGuilds } = require('./guildsSlice');

module.exports = configureStore({
  reducer: {
   guilds: guildsSlice.reducer
  },
  middleware: getDefaultMiddleware().concat(fetchAllGuilds),
  devTools: false,
})
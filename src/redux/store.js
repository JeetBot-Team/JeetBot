const { configureStore, getDefaultMiddleware } = require(`@reduxjs/toolkit`);
const { guildsSlice } = require(`./guildsSlice`);
const { dev } = require(`../../bot.config`);

module.exports = configureStore({
  reducer: {
    guilds: guildsSlice.reducer,
  },
  middleware: getDefaultMiddleware({
    immutableCheck: dev ? true : false,
    serializableCheck: dev ? true : false,
  }),
  devTools: false,
});

/*
For Production
  middleware: getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
  })

For Development
  middleware: getDefaultMiddleware();
*/

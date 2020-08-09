const { configureStore, getDefaultMiddleware } = require('@reduxjs/toolkit');
const { guildsSlice } = require('./guildsSlice');

module.exports = configureStore({
  reducer: {
   guilds: guildsSlice.reducer
  },
  middleware: getDefaultMiddleware({
    immutableCheck: false,
    serializableCheck: false,
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
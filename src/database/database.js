const mongoose = require('mongoose');

const DB_CONNECTION = process.env.DB_CONNECTION;

module.exports = mongoose.connect(DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true});
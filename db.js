const mongoose = require('mongoose');
const config = require('./config');
const mongoURL = config.MONGO_URL;

mongoose.Promise = global.Promise;
let isConnected;

module.exports = connectToDatabase = () => {
  if (isConnected) {
    console.log('=> using existing database connection');
    return Promise.resolve();
  }
  console.log('=> using new database connection');

  return mongoose.connect(mongoURL).then(db => {
    isConnected = db.connections[0].readyState;
  });
};

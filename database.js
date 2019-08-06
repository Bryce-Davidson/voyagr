const mongoose                         = require('mongoose');
const { MONGOURI, MONGO_DATABASE  }    = require('./config/keys.js')

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

const mongoOptions = {
  useNewUrlParser: true,
  autoIndex: false,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  poolSize: 10,
  bufferMaxEntries: 0
};

mongoose.connect(MONGOURI, mongoOptions);
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log(`Connected to Database: ${MONGO_DATABASE.NAME}\nuser: ${MONGO_DATABASE.USER}`);
});

// export the connection
module.exports = db;
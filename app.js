const express          = require('express');
const bodyParser       = require('body-parser');
const cookieParser     = require('cookie-parser');
const morgan           = require('morgan');
const helmet           = require('helmet');
const db               = require('./database');
const { SESSION_KEYS } = require('./config/keys')

// APP GLOBALS
const oneDay = 86400000;

// EXPRESS
var app = express()

// MIDDLE WEAR ----------------------------------------------------------------
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ROUTES ---------------------------------------------------------------------
app.use('/', require('./routes/Auth/auth-route'));
app.use('/users', require('./routes/Models/User/User-Routes'));
app.use('/trips', require('./routes/Models/Trips/Trip-Routes'));
app.use('/days', require('./routes/Models/Days/Day-Routes'));
app.use('/locations', require('./routes/Models/Locations/Location-Routes'));

// ERROR HANDELING ------------------------------------------

app.use(function mongoErrors(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err) {
    console.log(err)
  }

  if (err.name === 'CastError') {
    return res.status(500).send({name: err.name, message: err.message})
  }
  if (err.name === 'MongoError') {
    return res.status(500).send({name: err.name, message: err.errmsg})
  }
  if(err.name == 'ValidationError') {
    return res.status(500).send({name: err.name, message: err.message})
  }
  else next();
});


// INDEX ----------------------------------------------------------------------
app.get('/', (req, res, next) => {
  return res.json({msg: 'Home'})
});

module.exports = app;

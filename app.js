const express          = require('express');
const passport         = require('passport');
const bodyParser       = require('body-parser');
const cookieParser     = require('cookie-parser');
const session          = require('express-session');
const MongoStore       = require('connect-mongo')(session);
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
app.use(session({
  name: "ml-co923bk-we23",
  secret: SESSION_KEYS,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: db }),
  cookie: {
    maxAge: oneDay,
    httpOnly: true
  }
}));
app.use(passport.initialize());
app.use(passport.session());


// TEST ROUTES ----------------------------------------------------------------

app.use('/test', require('./tests/routes/tester-routes'))

// ROUTES ---------------------------------------------------------------------
app.use('/', require('./routes/Auth/auth-route'));
app.use('/users', require('./routes/Models/User/User-Routes'));
app.use('/trips', require('./routes/Models/Trips/Trip-Routes'));
app.use('/days', require('./routes/Models/Days/Day-Routes'));
app.use('/locations', require('./routes/Models/Locations/Location-Routes'));

// ERROR HANDELING ------------------------------------------

app.use(function mongoErrors(err, req, res, next) {
  if (res.headersSent) return next(err);

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
    res.send("Home");
});

module.exports = app;
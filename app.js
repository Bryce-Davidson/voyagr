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
// app.use(rateLimit({
//   windowMs: 20 * 60 * 1000, // 20 minutes
//   max: 100 // 100 requests per 20 minutes
// }));
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

// ERROR HANDLING ------------------------------------------------------------
app.use((err, req, res, next) => {
    if (err) {
      console.error(err);
      res.status(500).send({msg: "There was an internal error"})
    }
    else
      next();
});

// TEST ROUTES ----------------------------------------------------------------

app.use('/test', require('./tests/routes/tester-routes'))

// ROUTES ---------------------------------------------------------------------
app.use('/', require('./routes/Auth/auth-route'));
app.use('/users', require('./routes/Models/User/User-Routes'));
app.use('/trips', require('./routes/Models/Trips/Trip-Routes'));
app.use('/days', require('./routes/Models/Days/Day-Routes'));
app.use('/locations', require('./routes/Models/Locations/Location-Routes'));

// INDEX ----------------------------------------------------------------------
app.get('/', (req, res, next) => {
    res.send("Home");
});

module.exports = app;
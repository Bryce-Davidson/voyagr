const User               = require('../models/User/UserSchema');
const passport           = require('passport');
var LocalStrategy        = require('passport-local').Strategy;

// TODO: strip out passport

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, id);
});

// LOCAL ----------------------------------------------------------------------

// SIGNUP ---------------------------------------------------------------------

passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, (req, email, password, done) => {
    User.findOne({ $or: [{'local.email' :  email}, { 'local.username': req.body.username}] }, function(err, user) {
        if (err)
            return done(err);
        if (user) {
            return done(null, false);
        } else {
            let newUser = new User({
              'local.email':    email,
              'local.password': password,
              'local.username': req.body.username
            });
            newUser.save(function(err, user ) {
                if (err)
                    return done(err);
                // serialize the newUser
                return done(null, user);
            })
          }
        })
}));

// LOGIN ----------------------------------------------------------------------

passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
},
  (email, password, done) => {
    User.findOne({ 'local.email' :  email }) 
        .then(user => {
            if (!user || !password)
                return done(null, false);
            if (!user.validPassword(password))
                done(null, false);
            else
                return done(null, user);
            })
            .catch(err => done(err))
}));

module.exports = passport;
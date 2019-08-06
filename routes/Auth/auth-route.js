const passport                = require('../../config/passport');
var express                   = require('express');
var router                    = express.Router();
const {loggedInRedirect}      = require('../../util/auth-util');
const {
  signup,
  login
  }                           = require('../../controllers/Auth/auth-controller');

router.route('/signup')
  .get(signup.get)
  .post(passport.authenticate('local-signup', {
      successRedirect : '/',
      failureRedirect : '/signup',
      failureFlash : true
  }));

router.route('/login')
.get(loggedInRedirect, login.get)
.post(passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
}));

router.route('/logout')
  .get((req, res, next) => {
        req.logout();
        req.session.destroy()
        res.redirect('/');
  })

module.exports = router;
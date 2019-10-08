const passport                = require('../../config/passport');
var express                   = require('express');
var router                    = express.Router();
// const { loggedInRedirect } = require('../../util/auth/auth-status');
const {
  signup,
  login
  }                           = require('../../controllers/Auth/auth-controller');

router.route('/signup')
  .get(signup.get)
  .post(signup.post)

router.route('/login')
  .get(login.get)
  .post(login.post)

// router.route('/logout')
  // .get()

module.exports = router;
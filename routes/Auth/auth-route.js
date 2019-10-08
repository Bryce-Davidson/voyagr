const express                   = require('express');
const router                    = express.Router();
const {
  signup,
  login
}                               = require('../../controllers/Auth/auth-controller');

router.route('/signup')
  .get(signup.get)
  .post(signup.post)

router.route('/login')
  .get(login.get)
  .post(login.post)

// router.route('/logout')
  // .get()

module.exports = router;
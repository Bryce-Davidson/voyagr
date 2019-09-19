const express               = require('express');
const router                = express.Router();
const { isLoggedIn }        = require('../../../util/middleware/auth-util');
const User                  = require('../../../models/User/UserSchema');


module.exports = router;

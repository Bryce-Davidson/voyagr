const { userProfileUpload } = require('../../../controllers/Models/User/User-Controller');
const express               = require('express');
const router                = express.Router();
const { isLoggedIn }        = require('../../../util/middleware/auth-util');
const globalSearch          = require('../../../util/middleware/search-posts-util');
const User                  = require('../../../models/User/UserSchema');

router.route('/:id/upload/profile')
    .post(isLoggedIn, userProfileUpload)

module.exports = router;

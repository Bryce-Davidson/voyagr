const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util//middleware/auth-util');
const { 
    addCommentUtil,
    LikePostUtil,
    deletePostUtil
 } = require('../../../util/middleware/post-actions-util');
const {
    newDay,
    viewDay,
    featuredDays,
    addLocationToDay,
    addComment
} = require('../../../controllers/Models/Days/Day-Controller');

// MODEL
const Day = require('../../../models/Day/DaySchema');

// GET 
router.route('/featured')
    .get(featuredDays)

router.route('/:id')
    .get(viewDay)

// POST 

router.route('/newday')
    .get(isLoggedIn)
    .post(isLoggedIn, newDay)

router.route('/:id/addlocation/:locationid')
    .post(isLoggedIn, addLocationToDay)

router.route('/:id/addcomment')
    .post(isLoggedIn, addCommentUtil(Day))

router.route('/:id/like')
    .post(isLoggedIn, LikePostUtil(Day))

router.route('/:id/delete')
    .delete(isLoggedIn, deletePostUtil(Day))

module.exports = router;
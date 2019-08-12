const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util//middleware/auth-util');
const { 
    addCommentUtil,
    LikePostUtil,
    deletePostUtil,
    textSearchPostUtil,
    getFeaturedPostsUtil
 } = require('../../../util/middleware/post-actions-util');
const {
    newDay,
    viewDay,
    addLocationToDay
} = require('../../../controllers/Models/Days/Day-Controller');

const Day = require('../../../models/Day/DaySchema');

router.route('/featured')
    .get(getFeaturedPostsUtil(Day))

router.route('/search')
    .post(textSearchPostUtil(Day));

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

    router.route('/:id')
    .get(viewDay)

module.exports = router;
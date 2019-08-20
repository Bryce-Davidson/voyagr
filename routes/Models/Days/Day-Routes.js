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
    addLocationToDay,
    updateDay,
    dayBannerUpload
} = require('../../../controllers/Models/Days/Day-Controller');

const Day = require('../../../models/Day/DaySchema');

// SEARCH AND FEATURED ----------------------------------

router.route('/search')
    .post(textSearchPostUtil(Day));

router.route('/featured')
    .get(getFeaturedPostsUtil(Day))

// CREATE -----------------------------------------------

router.route('/newday')
    .get(isLoggedIn)
    .post(isLoggedIn, newDay)

// PHOTOS -----------------------------------------------

router.route('/:id/upload/banner')
    .post(isLoggedIn, dayBannerUpload)

// UPDATE -----------------------------------------------

router.route('/:id/addlocation/:locationid')
    .post(isLoggedIn, addLocationToDay)

router.route('/:id/addcomment')
    .post(isLoggedIn, addCommentUtil(Day))

router.route('/:id/like')
    .post(isLoggedIn, LikePostUtil(Day))

router.route('/:id/edit')
    .post(isLoggedIn, updateDay)


// READ -----------------------------------------------


router.route('/:id')
    .get(viewDay)

// DELETE -----------------------------------------------

router.route('/:id/delete')
    .delete(isLoggedIn, deletePostUtil(Day))


module.exports = router;
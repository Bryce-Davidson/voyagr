const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util');
const { 
    addCommentUtil,
    LikePostUtil,
    deletePostUtil,
    textSearchPostUtil,
    getFeaturedPostsUtil
 } = require('../../../util/middleware/post-actions-util');
const {
    newTrip,
    addDayToTrip,
    viewTrip,
    makeChildrenPrivate,
    makeChildrenPublic
} = require('../../../controllers/Models/Trip/Trip-Controller');

const Trip = require('../../../models/Trip/TripSchema');

router.route('/featured')
    .get(getFeaturedPostsUtil(Trip));

router.route('/newtrip')
    .get(isLoggedIn)
    .post(isLoggedIn, newTrip);

router.route('/:id/addday/:dayid')
    .post(isLoggedIn, addDayToTrip);

router.route('/search')
    .post(textSearchPostUtil(Trip))

router.route('/:id/days/private')
    .post(makeChildrenPrivate)

router.route('/:id/days/public')
    .post(makeChildrenPublic)

router.route('/:id')
    .get(viewTrip);

// ADD COMMENT
router.route('/:id/addcomment')
    .post(isLoggedIn, addCommentUtil(Trip));

// LIKE POST
router.route('/:id/like')
    .post(isLoggedIn, LikePostUtil(Trip));

// DELETE -----------------------------------------------

router.route('/:id/delete')
    .delete(isLoggedIn, deletePostUtil(Trip))

module.exports = router;
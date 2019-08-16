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
    updateTrip
} = require('../../../controllers/Models/Trip/Trip-Controller');

const Trip = require('../../../models/Trip/TripSchema');

router.route('/search')
    .post(textSearchPostUtil(Trip))

router.route('/featured')
    .get(getFeaturedPostsUtil(Trip));

router.route('/newtrip')
    .get(isLoggedIn)
    .post(isLoggedIn, newTrip);

router.route('/:id/addday/:dayid')
    .post(isLoggedIn, addDayToTrip);

router.route('/:id')
    .get(viewTrip);

router.route('/:id/addcomment')
    .post(isLoggedIn, addCommentUtil(Trip));

router.route('/:id/like')
    .post(isLoggedIn, LikePostUtil(Trip));

router.route('/:id/update')
    .put(isLoggedIn, updateTrip)

// DELETE -----------------------------------------------

router.route('/:id/delete')
    .delete(isLoggedIn, deletePostUtil(Trip))

module.exports = router;
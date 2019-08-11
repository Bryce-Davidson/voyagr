const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util');
const { 
    addCommentUtil,
    LikePostUtil,
    deletePostUtil
 } = require('../../../util/middleware/post-actions-util');
const {
    newTrip,
    addDayToTrip,
    viewTrip,
    featuredTrips
} = require('../../../controllers/Models/Trip/Trip-Controller');

// MODEL
const Trip = require('../../../models/Trip/TripSchema');

// GET ----------------------------------------------------------------------

router.route('/featured')
    .get(featuredTrips);

router.route('/:id')
    .get(viewTrip);

// POST ---------------------------------------------------------------------

// NEW TRIP
router.route('/newtrip')
    .get(isLoggedIn)
    .post(isLoggedIn, newTrip);

// ADD DAY
router.route('/:id/addday/:dayid')
    .post(isLoggedIn, addDayToTrip);

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
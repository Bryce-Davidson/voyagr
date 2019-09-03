const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util');
const globalSearch = require('../../../util/middleware/search-posts-util');
const { 
    addCommentUtil,
    LikePostUtil,
    deletePostUtil,
    getFeaturedPostsUtil
} = require('../../../util/middleware/post-actions-util');
const {
    newTrip,
    addDayToTrip,
    viewTrip,
    updateTrip,
    tripBannerUpload
} = require('../../../controllers/Models/Trip/Trip-Controller');

const Trip = require('../../../models/Trip/TripSchema');


// CURRENTLY ON - /trips

router.route('/')
    .get('get all trips, get trips with query string "search"')
    .post('create new trip')

// /trips/:id
router.route('/:id')
    .get('get the trip in question')
    .put('update the trip in question')
    .delete('delete the trip in question')

router.route('/:id/days')
    .get('get the days of the trip in question')
    .post('push in the day id within the query string')
    .put('change the status of the days in the trip')

module.exports = router;
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util');

const { 
    getTrips, 
    postTrip 
} = require('../../../controllers/Models/Trip/Trip-Controller').tripsRoot;

const {
    getTrip,
    getTripDays,
    updateTrip,
    deleteTrip
} = require('../../../controllers/Models/Trip/Trip-Controller').tripResource;

const Trip = require('../../../models/Trip/TripSchema');


// CURRENTLY ON - /trips

router.route('/')
    .get(getTrips)
    .post(isLoggedIn, postTrip)

// /trips/:id -> id = trip id
router.route('/:id')
    .get(getTrip)
    .put(isLoggedIn, updateTrip)
    .delete(isLoggedIn, deleteTrip)

// router.route('/:id/days')
    // .get('get the days of the trip in question')
    // .post('OWNER - push in the day id within the query string')
    // .put('OWNER - change the status of the days in the trip')

// router.route('/:id/photos')
    // .get('get the photo strings of the trip in question')
    // .post('OWNER - add photo to trip')

// router.route('/:id/comments')
    // .get('get all posts comments')
    // .post('add new comment')

// router.route('/:id/likes')
    // .get('get of users who like post')
    // .post('like trip with user - {cant like own post}')
    // .delete('unlike post')

module.exports = router;
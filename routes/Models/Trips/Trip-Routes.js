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
    deleteTrip,
    addDayToTrip,
    deleteDaysFromTrip
} = require('../../../controllers/Models/Trip/Trip-Controller').tripResource;

router.post('*', isLoggedIn);
router.put('*', isLoggedIn);
router.delete('*', isLoggedIn);

// CURRENTLY ON - /trips

router.route('/')
    .get(getTrips)
    .post(postTrip)

router.route('/:id')
    .get(getTrip)
    .put(updateTrip)
    .delete(deleteTrip)

router.route('/:id/days')
    .get(getTripDays)
    .post(addDayToTrip)
    .delete(deleteDaysFromTrip)
    // .put('OWNER - change the status of the days in the trip')

// router.route('/:id/comments')
    // .get('get all posts comments')
    // .post('add new comment')

// router.route('/:id/likes')
    // .get('get of users who like post')
    // .post('like trip with user - {cant like own post}')
    // .delete('unlike post')

module.exports = router;
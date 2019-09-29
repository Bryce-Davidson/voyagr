const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/auth/auth-status');
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

const {
    likeTrip,
    postCommentTrip,
    getTripComments,
    getTripLikes
} = require('../../../controllers/Models/Trip/trip-controller').tripMeta;

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

router.route('/:id/comments')
    .get(getTripComments)
    .post(postCommentTrip)

router.route('/:id/likes')
    .get(getTripLikes)
    .put(likeTrip)
    // .delete('unlike post')

module.exports = router;
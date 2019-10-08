const express = require('express');
const router = express.Router();
const verifyToken = require('../../../util/middleware/auth/verifyToken');
const validateToken = require('../../../util/middleware/auth/validateToken');
const mountUser     = require('../../../util/middleware/auth/mountUser');

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

const authValidation = [verifyToken, validateToken]
const mountUserId  = [mountUser, validateToken]

router.get('*', mountUserId)
router.post('*', authValidation);
router.put('*', authValidation);
router.delete('*', authValidation);

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
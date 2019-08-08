const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/auth-util');
const {
    newTrip,
    addDayToTrip,
    viewTrip,
    addComment,
    featuredTrips
} = require('../../../controllers/Models/Trip/Trip-Controller');

// MODEL
const Trip = require('../../../models/Trip/TripSchema');

// GET 

router.route('/featured')
    .get(featuredTrips)

router.route('/:id')
    .get(viewTrip)

// POST 
router.route('/newtrip')
    .get(isLoggedIn)
    .post(isLoggedIn, newTrip)

router.route('/:id/addday/:dayid')
    .post(isLoggedIn, addDayToTrip)

router.route('/:id/addcomment')
    .post(isLoggedIn, addComment)



module.exports = router;
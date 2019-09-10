const express        = require('express');
const router         = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util');
const Day            = require('../../../models/Day/DaySchema');

const {
    getDays,
    postDay
}   = require('../../../controllers/Models/Days/Day-Controller').daysRoot;

const { 
    getDay,
    updateDay,
    deleteDay,
    getDayLocations,
    addLocationToDay,
    deleteLocationsFromDay
 } = require('../../../controllers/Models/Days/Day-Controller').dayResource;

router.post('*', isLoggedIn)
router.put('*', isLoggedIn)
router.delete('*', isLoggedIn)

router.route('/')
    .get(getDays)
    .post(postDay)

router.route('/:id')
    .get(getDay)
    .put(updateDay)
    .delete(deleteDay)

router.route('/:id/locations')
    .get(getDayLocations)
    .post(addLocationToDay)
    .delete(deleteLocationsFromDay)

// router.route('/:id/comments')
    // .get('get all posts comments')
    // .post('add new comment')

// router.route('/:id/likes')
    // .get('get of users who like post')
    // .post('like trip with user - {cant like own post}')
    // .delete('unlike post')

module.exports = router;
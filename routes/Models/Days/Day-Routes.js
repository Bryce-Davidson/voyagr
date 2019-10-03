const express        = require('express');
const router         = express.Router();
const { isLoggedIn } = require('../../../util/auth/auth-status');
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

const {
    likeDay,
    postCommentDay,
    getDayComments,
    getDayLikes
} = require('../../../controllers/Models/Days/Day-Controller').dayMeta;

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

router.route('/:id/comments')
    .get(getDayComments)
    .post(postCommentDay)

router.route('/:id/likes')
    .get(getDayLikes)
    .put(likeDay)
    // .delete('unlike post')

module.exports = router;
const express        = require('express');
const router         = express.Router();
const verifyToken = require('../../../util/middleware/auth/verifyToken');
const validateToken = require('../../../util/middleware/auth/validateToken');
const mountUser     = require('../../../util/middleware/auth/mountUser');

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
    deleteLikeday,
    postCommentDay,
    getDayComments,
    deleteCommentDay,
    getDayLikes
} = require('../../../controllers/Models/Days/Day-Controller').dayMeta;

const authValidation = [verifyToken, validateToken]
const mountUserId  = [mountUser, validateToken]

router.get('*', mountUserId)
router.post('*', authValidation)
router.put('*', authValidation)
router.delete('*', authValidation)

router.route('/')
    .get(getDays)
    .post(postDay)

router.route('/:id')
    .get(getDay)
    .put(updateDay)
    .delete(deleteDay)

router.route('/:id/locations')
    .get(getDayLocations)
    .put(addLocationToDay)
    .delete(deleteLocationsFromDay)

router.route('/:id/comments')
    .get(getDayComments)
    .post(postCommentDay)
    .delete(deleteCommentDay)

router.route('/:id/likes')
    .get(getDayLikes)
    .put(likeDay)
    .delete(deleteLikeday)

module.exports = router;
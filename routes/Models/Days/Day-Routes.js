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
    .get()
    .post()
    .delete()

module.exports = router;
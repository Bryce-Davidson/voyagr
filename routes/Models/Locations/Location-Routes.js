const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/auth-util')
const {newLocation, findNear, featuredLocations} = require('../../../controllers/Models/Locations/Location-Controllers')

// MODELS
const Location = require('../../../models/Location/LocationSchema')

// GETTING Locations
router.route('/findnear')
  .post(findNear)

router.route('/featured')
  .get(featuredLocations)

// POSTING Locations
router.route('/newlocation')
  .post(isLoggedIn, newLocation)

module.exports = router;

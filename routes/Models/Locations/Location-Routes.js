const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/auth-util')
const {
  newLocation, 
  findNear, 
  featuredLocations,
  addComment,
  viewLocation
} = require('../../../controllers/Models/Locations/Location-Controllers')

// MODEL
const Location = require('../../../models/Location/LocationSchema')

// SEARCHING Locations
router.route('/findnear')
  .post(findNear)

// VIEWING Locations
router.route('/:id')
  .get(isLoggedIn, viewLocation)

router.route('/featured')
  .get(featuredLocations)

// POSTING Locations
router.route('/newlocation')
  .post(isLoggedIn, newLocation)

// PUTTING/UPDATING Locations
router.route('/:id/addcomment')
  .post(isLoggedIn, addComment);

module.exports = router;

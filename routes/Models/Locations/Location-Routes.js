const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util')

const { 
  getLocations,
  postLocation
} = require('../../../controllers/Models/Locations/location-controllers').LocationsRoot;
const { 
  getLocation,
  updateLocation,
  deleteLocation  
} = require('../../../controllers/Models/Locations/location-controllers').LocationResource;



router.post('*', isLoggedIn);
router.put('*', isLoggedIn);
router.delete('*', isLoggedIn);

router.route('/')
  .get(getLocations)
  .post(postLocation)

router.route('/:id')
  .get(getLocation)
  .put(updateLocation)
  .delete(deleteLocation)


module.exports = router;

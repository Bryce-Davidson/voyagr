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

// router.route('/:id/comments')
    // .get('get all posts comments')
    // .post('add new comment')

// router.route('/:id/likes')
    // .get('get of users who like post')
    // .post('like trip with user - {cant like own post}')
    // .delete('unlike post')


module.exports = router;

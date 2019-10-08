const express = require('express');
const router = express.Router();
const verifyToken = require('../../../util/middleware/auth/verifyToken');
const validateToken = require('../../../util/middleware/auth/validateToken');
const mountUser     = require('../../../util/middleware/auth/mountUser');

const { 
  getLocations,
  postLocation
} = require('../../../controllers/Models/Locations/location-controllers').LocationsRoot;
const { 
  getLocation,
  updateLocation,
  deleteLocation,
} = require('../../../controllers/Models/Locations/location-controllers').LocationResource;

const {
  likeLocation,
  commentLocation
} = require('../../../controllers/models/Locations/location-controllers').LocationMeta

const authValidation = [verifyToken, validateToken]
const mountUserId  = [mountUser, validateToken]

router.get('*', mountUserId)
router.post('*', authValidation);
router.put('*', authValidation);
router.delete('*', authValidation);

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

router.route('/:id/likes')
    // .get()
    .put(likeLocation)
    // .delete('unlike post')


module.exports = router;

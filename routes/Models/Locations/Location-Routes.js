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
  getlocationLikes,
  postCommentLocation,
  getLocationComments,
  deleteCommentLocation
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

router.route('/:id/comments')
    .get(getLocationComments)
    .post(postCommentLocation)
    .delete(deleteCommentLocation)

router.route('/:id/likes')
    .put(likeLocation)
    .get(getlocationLikes)
    // .delete('unlike pSost')


module.exports = router;

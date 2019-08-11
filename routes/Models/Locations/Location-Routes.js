const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util')
const { 
  addCommentUtil,
  LikePostUtil,
  deletePostUtil
 } = require('../../../util/middleware/post-actions-util');
const {
  newLocation, 
  findNear, 
  featuredLocations,
  viewLocation
} = require('../../../controllers/Models/Locations/Location-Controllers')

// MODEL
const Location = require('../../../models/Location/LocationSchema')


router.route('/findnear')
  .post(findNear)

router.route('/:id')
  .get(isLoggedIn, viewLocation)

router.route('/featured')
  .get(featuredLocations)

router.route('/newlocation')
  .post(isLoggedIn, newLocation)

router.route('/:id/addcomment')
  .post(isLoggedIn, addCommentUtil(Location));

router.route('/:id/like')
  .post(isLoggedIn,LikePostUtil(Location))

// DELETE ---------------------------------------------------------

router.route('/:id/delete')
  .delete(isLoggedIn, deletePostUtil(Location))

module.exports = router;

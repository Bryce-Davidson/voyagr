const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../../util/middleware/auth-util')
const { 
  addCommentUtil,
  LikePostUtil,
  deletePostUtil,
  getFeaturedPostsUtil 
} = require('../../../util/middleware/post-actions-util');

const {
  newLocation, 
  findNear, 
  viewLocation
} = require('../../../controllers/Models/Locations/Location-Controllers')

const Location = require('../../../models/Location/LocationSchema')

router.route('/findnear')
  .post(findNear)

router.route('/newlocation')
  .post(isLoggedIn, newLocation)

router.route('/featured')
  .get(getFeaturedPostsUtil(Location))

router.route('/:id/like')
  .post(isLoggedIn,LikePostUtil(Location))

router.route('/:id/addcomment')
  .post(isLoggedIn, addCommentUtil(Location));

router.route('/:id')
  .get(isLoggedIn, viewLocation)

// DELETE ---------------------------------------------------------

router.route('/:id/delete')
  .delete(isLoggedIn, deletePostUtil(Location))

module.exports = router;

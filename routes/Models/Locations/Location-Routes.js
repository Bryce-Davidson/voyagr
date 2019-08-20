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
  viewLocation,
  photoUploadToLocation
} = require('../../../controllers/Models/Locations/Location-Controllers')

const Location = require('../../../models/Location/LocationSchema')

// SEARCH AND FEATURED ----------------------------------

router.route('/featured')
  .get(getFeaturedPostsUtil(Location))

router.route('/findnear')
  .post(findNear)

// CREATE ------------------------------------------------

router.route('/newlocation')
  .post(isLoggedIn, newLocation)


// PHOTOS -----------------------------------------------

router.route('/:id/upload/photos')
  .post(isLoggedIn, photoUploadToLocation)

// UPDATE ------------------------------------------------

router.route('/:id/like')
  .post(isLoggedIn,LikePostUtil(Location))

router.route('/:id/addcomment')
  .post(isLoggedIn, addCommentUtil(Location));


// READ ---------------------------------------------------

router.route('/:id')
  .get(isLoggedIn, viewLocation)

// DELETE -------------------------------------------------

router.route('/:id/delete')
  .delete(isLoggedIn, deletePostUtil(Location))

module.exports = router;

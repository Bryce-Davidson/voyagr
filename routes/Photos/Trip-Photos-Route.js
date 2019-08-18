const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../../util/middleware/auth-util');
const  { tripBannerUpload } = require('../../controllers/Photos/Trip-Photos-Controller');
const upload = require('../../util/middleware/photo-upload');

// /trips

// the upoad single('image') accounts for the file key that we need to name it in order for
// multer to attach it to req.file
router.route('/:id/upload/banner')
    .post(isLoggedIn, upload.single('banner'), tripBannerUpload)

module.exports = router;
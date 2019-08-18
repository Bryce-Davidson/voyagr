const express = require('express');
const router = express.Router();
const upload = require('../../util/middleware/photo-upload');

const singleUpload = upload.single('banner');
 
router.post('/:id/upload/banner', function(req, res, next) {
  singleUpload(req, res, function(err) {
    res.json({'img-url': req.file.location})
  })
})

module.exports = router;

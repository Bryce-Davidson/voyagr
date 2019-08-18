const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const uuidv4 = require('uuid/v4');


AWS.config.update({
    secretAccessKey: '0FnUHLqqXqgNXYyippFwlBnEZVANWxyut9MYXCiw',
    accessKeyId: 'AKIAJ6WPZAQSUMO5HW7A',
    region: 'us-west-2',
})

const s3 = new AWS.S3()
 
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'voyagr-images',
    acl: 'public-read', 
    metadata: function (req, file, cb) {
      cb(null, {
          fieldName: file.fieldname, 
          user: req.user,
          timestamp: Date.now().toString()
        });
    },
    key: function (req, file, cb) {
      cb(null, uuidv4())
    }
})
})

module.exports = upload;
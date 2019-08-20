const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const awsconfig = require('../../config/keys').AWS.config;
const uuidv4 = require('uuid/v4');

AWS.config.update(awsconfig)

const s3 = new AWS.S3()
 
const photoFilter = (req, file, cb) => {
    if (file.mimetype !== 'image/jpg' || file.mimetype !== 'image/png')
        cb(null, true);
    else
        cb(new Error('Invalid mime type, only JPEG or PNG', false));
}

const upload = multer({
    fileFilter: photoFilter,
    storage: multerS3({
        s3,
        bucket: function(req, file, cb) {
            cb(null, req.bucketName)
        },
        acl: 'public-read', 
        cacheControl: 'max-age=31536000',
        contentType: multerS3.AUTO_CONTENT_TYPE,    
        metadata: function (req, file, cb) {
            cb(null, {
                fieldName: file.fieldname, 
                user: req.user,
                timestamp: Date.now().toString()
            });
        },
        key: function (req, file, cb) {
            let extension = file.mimetype.split('/')[1]
            cb(null, `${uuidv4()}.${extension}`)
        }
    })
})

module.exports = upload;
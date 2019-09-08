const Trip                  = require('../../../models/Trip/TripSchema');
const Day                   = require('../../../models/Day/DaySchema');
const User                  = require('../../../models/User/UserSchema');
const { userCanAlter }      = require('../../../util/local-functions/instance-validation');
const { USERBUCKET }        = require('../../../config/keys').AWS;
const upload                = require('../../../util/middleware/photo-upload-util');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const singleUpload = upload.single('profile');

const userProfileUpload = (req, res, next) => {
    req.bucketName = USERBUCKET;
    User.findById(req.params.id)
        .then(user => {
        if(!user)
            return res.status(404).send("User doesn't exist")
        if(user._id == req.user) {
            // Upload file to S3
            singleUpload(req, res, function(err) {
            if(err) return next(err);
            if(!req.file) return res.send("Please include at least one photo")
            // if banner already exists delete from S3
            if(user.photos.profile) {
                let s3ProfileKey = user.photos.profile.split('/'); 
                    s3ProfileKey = s3ProfileKey[s3ProfileKey.length - 1];
                let params = { Bucket: req.bucketName, Key: s3ProfileKey};
                S3.deleteObject(params).promise()
                .catch(next)
            }
            // always save newly uploaded banner to mongodb
            user.photos.profile = req.file.location;
            // potentially add the resized versions here
            return user.save()
                .then(uuser => {
                    res.send(uuser)
                })
            })
        } else {
            res.status(401).send('Unauthorized')
        }
        })
        .catch(next)
}

module.exports = {
    userProfileUpload
};
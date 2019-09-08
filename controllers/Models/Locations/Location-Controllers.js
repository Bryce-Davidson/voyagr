const Location                          = require('../../../models/Location/LocationSchema');
const User                              = require('../../../models/User/UserSchema');
const { userCanAlter }                  = require('../../../util/local-functions/instance-validation');
const { locationBucket }                = require('../../../config/keys').AWS;
const upload                            = require('../../../util/middleware/photo-upload-util');
const { collisionPaths, newPhotoPaths } = require('./locations-photo-helpers');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// CREATE -------------------------------------------------------------------------

const newLocation = (req, res, next) => {
  const {coordinates, name,tags } = req.body
  let userid = req.session.passport.user;
  // SWITCH from [lat, long] to [long, lat] for mongo
  coordinates.reverse();
  let newLocation = new Location({
    "name": name,
    "user": req.user,
    "location": {
      "type": "Point",
      "coordinates": coordinates
    },
    "meta": {tags}
  })
  newLocation.save()
  .then(location => {
    return User.findByIdAndUpdate(userid, {
      $push: {'posts.locations': location._id}
    })
    .then(user => res.send(location))
  })
  .catch(next)
}

// PHOTOS --------------------------------------------------------------------



const fields = [
  {name: 'image_1', maxCount: 1},
  {name: 'image_2', maxCount: 1},
  {name: 'image_3', maxCount: 1},
  {name: 'image_4', maxCount: 1},
  {name: 'image_5', maxCount: 1}
]

const mulitplePhotoUpload = upload.fields(fields);

const photoUploadToLocation = async function(req, res, next) {
  req.bucketName = locationBucket;
  Location.findById(req.params.id)
  .then(location => {
    // check if user owns document
    if(userCanAlter(location, req.user, res)) {
      mulitplePhotoUpload(req, res, function(err) {
        // check errors
        if(err) return next(err);
            // check if photos were uploaded
            else if (!req.files) return res.send('Please provide atleast one photo');
            // check if photos in uplaoded spots already exist
            let deletePaths = collisionPaths(location.photos, req.files)
            if (deletePaths.length !== 0)  {
              // if exist delete from S3
              deletePaths.forEach(deletekey => {
                let params = { Bucket: req.bucketName, Key: deletekey};
                S3.deleteObject(params).promise()
                  .catch(next)
              })
            }
            // get the S3 saved locations from the req.files object
            // merge the new upload paths into the location removing the old photos
            location.photos = newPhotoPaths(location.photos, req.files)
            return location.save()
              .then(uloc => res.send(uloc))
          })
        }
    }).catch(next)
}

// READ -----------------------------------------------------------------------

const findNear = (req, res, next) => {
  var { coordinates, maxDistance } = req.body;

  Location.find().nearPoint(coordinates, maxDistance)
      .populate('user', 'local.username')
      .then(data => res.send(data))
      .catch(next)
};

const viewLocation = (req, res, next) => {
  Location.findByIdAndUpdate(req.params.id, {'$inc': {'meta.viewCount': 1}}, {new: true})
    .populate('comments')
    .then(data => {
      res.send((data));
    })
    .catch(next)
};


module.exports = { 
  findNear, 
  newLocation, 
  viewLocation,
  photoUploadToLocation
}
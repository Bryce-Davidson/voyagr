const Location = require('../../../models/Location/LocationSchema');
const User = require('../../../models/User/UserSchema');
const { userCanAlter } = require('../../../util/local-functions/schemaMethods');
const { locationBucket } = require('../../../config/keys').AWS;
const upload = require('../../../util/middleware/photo-upload-util');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// CREATE -------------------------------------------------------------------------

const newLocation = (req, res, next) => {
  const {coordinates, name } = req.body
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

// I have an array of keys
// check an object to see if it has these keys
// if it has the key, save the keys value

function getDeletePaths(locationPhotos, reqFiles) {
  let newPhotoKeys = Object.keys(reqFiles);
  let deletePaths = [];
  newPhotoKeys.forEach(key => {
    if (locationPhotos[key]) {
      let path = locationPhotos[key].split('/')
          path = path[path.length - 1]
      deletePaths.push(path)
    }
  })
  return deletePaths;
}

function updatePhotoPaths(target, filesobj) {
    let update = {};
    Object.entries(filesobj).forEach(([key, val]) => {
        update[key] = val[0].location
    });
    return Object.assign(target, update)
}
 
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
            // check if photos in positions already exist
            let deletePaths = getDeletePaths(location.photos, req.files)
            if (deletePaths.length !== 0)  {
              // loop through delete paths and remove from amazon S3
              deletePaths.forEach(deletekey => {
                let params = { Bucket: req.bucketName, Key: deletekey};
                S3.deleteObject(params).promise()
                  .catch(next)
              })
            }
            location.photos = updatePhotoPaths(location.photos, req.files)
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
      .then(data => res.send(data))
      .catch(next)
};

const viewLocation = (req, res, next) => {
  Location.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
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
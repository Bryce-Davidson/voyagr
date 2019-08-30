const Trip                  = require('../../../models/Trip/TripSchema');
const Day                   = require('../../../models/Day/DaySchema');
const User                  = require('../../../models/User/UserSchema');
const { userCanAlter }      = require('../../../util/local-functions/schemaValidationMethods');
const { TRIPBUCKET }        = require('../../../config/keys').AWS;
const upload                = require('../../../util/middleware/photo-upload-util');


const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// TODO:
    // [] add trips to days when adding day


// CREATE -------------------------------------------------------------------------

const newTrip = (req, res, next) => {
    const {name, description, tags, private, lowerBound, upperBound} = req.body;
    let userid = req.user;
    let newTrip = new Trip({
        user: userid,
        name, description, private,
        settings: {private},
        budget: { 
            lowerBound, 
            upperBound, 
            middleBound: Math.round(upperBound + lowerBound / 2)
        },
        meta: {tags}
    })
    newTrip.save()
    .then(trip => {
        return User.findByIdAndUpdate(userid, {
            $push: {'posts.trips': trip._id}
        })
        .then(user => res.send(trip))
    })
    .catch(next)
};

// PHOTOS ---------------------------------------------------------------------------

const singleUpload = upload.single('banner');

const tripBannerUpload = (req, res, next) => {
    req.bucketName = TRIPBUCKET;
    if(!req.file) return res.send('Please provide atleast one photo');
    Trip.findById(req.params.id)
        .then(trip => {
        if(userCanAlter(trip, req.user, res)) {
            // Upload file to S3
            singleUpload(req, res, function(err) {
            if(err) return next(err);
            if(!req.file) return res.send("Please include at least one photo")
            // if banner already exists delete from S3
            if(trip.photos.banner) {
                let s3BannerKey = trip.photos.banner.split('/'); 
                    s3BannerKey = s3BannerKey[s3BannerKey.length -1];
                let params = { Bucket: req.bucketName, Key: s3BannerKey};
                S3.deleteObject(params).promise()
                .catch(next)
            }
            // always save newly uploaded banner to mongodb
            trip.photos.banner = req.file.location;
            return trip.save()
                .then(utrip => {
                res.send(utrip)
                })
            })
        }
        })
        .catch(next)
}


// READ --------------------------------------------------------------------------

const viewTrip = (req, res, next) => {
    Trip.findById(req.params.id)
        .then(trip => {
            if(trip.user == req.user) {
                return Trip.findById(trip._id)
                .populate('user', 'local.username -_id')
                .populate({
                    path: 'comments',
                    select: '-tripid',
                    populate: { path: 'user', select: 'local.username -_id' }
                })
                .populate('days')
                .then(trip => {return res.send(trip)})
            }
            Trip.findByIdAndUpdate(req.params.id, {'$inc': {'meta.viewCount': 1}}, {new: true})
                .populate('user', 'local.username -_id')
                .populate({
                    path: 'comments',
                    select: '-tripid',
                    populate: { path: 'user', select: 'local.username -_id' }
                })
                .populate('days')
                .then(utrip => {
                    res.send(utrip)
                })
        }).catch(next)
}

// UPDATE -----------------------------------------------------------------------------

const addDayToTrip = (req, res, next) => {
    let tripid = req.params.id;
    let dayid  = req.params.dayid;
    Trip.findById(tripid)
        .then(trip => {
            if(userCanAlter(trip, req.user, res)) {
                trip.days.push(dayid)
                return trip.save().then(newTrip => res.send(newTrip))
            }
        }).catch(err)
}

const updateTrip = (req, res, next) => {
    let update = req.body.update;
    let tripid = req.params.id;
    Trip.findById(tripid)
        .then(trip => {
            if(userCanAlter(trip, req.user)) {
                return trip.findByIdAndUpdate(trip.id, update)
                    .then(utrip => res.send(utrip))
            }
        }).catch(next)
}

// CHILDREN FUNCTIONS --------------------------

const changeChildStatus = (req, res, next) => {
    let status = req.query.status;
    if (status != 'true' || 'false') {
        return res.send("Invaid status")
    }
    Trip.findById(req.params.id)
        .then(trip => {
            if(userCanAlter(trip, req.user, res)) {
                return trip.changeChildStatus(status)
                    .then(trip => {
                        res.send(trip)
                    })
            }
        }).catch(next)
}

module.exports = {
    newTrip,
    addDayToTrip,
    viewTrip,
    changeChildStatus,
    updateTrip,
    tripBannerUpload
};
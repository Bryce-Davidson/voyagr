const User              = require('../../../models/User/UserSchema');
const Day               = require('../../../models/Day/DaySchema');
const { userCanAlter }  = require('../../../util/local-functions/schemaValidationMethods');
const { dayBucket }     = require('../../../config/keys').AWS;
const upload            = require('../../../util/middleware/photo-upload-util');


const AWS = require('aws-sdk')
const S3 = new AWS.S3()


// CREATE -------------------------------------------------------------------------

const newDay = (req, res, next) => {
    let userid = req.session.passport.user;
    const { name, description } = req.body;
    Day.create({
        user: userid,
        name, description
    })
    .then(day => {
        return User.findByIdAndUpdate(userid, {
            $push: {'posts.days': day._id}
        })
        .then(user => res.send(day))
    })
    .catch(next)
};

// PHOTOS -----------------------------------------------------------------------

const singleUpload = upload.single('banner');

const dayBannerUpload = (req, res, next) => {
    req.bucketName = dayBucket;
    Day.findById(req.params.id)
        .then(day => {
        if(userCanAlter(day, req.user, res)) {
            // Upload file to S3
            singleUpload(req, res, function(err) {
            if(err) return next(err);
            else if(!req.file) return res.status(402).send('Please provide a banner image');
            // if banner already exists delete from S3
            if(day.photos.banner) {
                let s3BannerKey = day.photos.banner.split('/'); 
                    s3BannerKey = s3BannerKey[s3BannerKey.length -1];
                let params = { Bucket: req.bucketName, Key: s3BannerKey};
                S3.deleteObject(params).promise()
                .catch(next)
            } 
            // always save newly uploaded banner to mongodb
            day.photos.banner = req.file.location;
            return day.save()
                .then(uday => {
                res.send(uday)
                })
            })
        }
        })
        .catch(next)
}
// READ --------------------------------------------------------------------------

const viewDay = (req, res, next) => {
    Day.findById(req.params.id)
        .then(day => {
            if (day.settings.private) {
                if (req.user == day.user) res.send(day)
                else res.status(401).send('Unauthorized')
            } else {
                return Day.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
                .populate('comments')
                .populate('locations')
                .populate('user', 'local.username')
                .then(data => {
                    res.send((data));
                })
            }
        })
        .catch(next)
}

// UPDATE ---------------------------------------------------------------

const addLocationToDay = (req, res, next) => {
    let dayid = req.params.id;
    let locid = req.params.locationid;
    Day.findById(dayid)
        .then(day => {
            if (userCanAlter(day, req.user, res)) {
                day.locations.push(locid)
                return day.save().then(uday => res.send(uday))
            }
        }).catch(next)
}

const updateDay = (req, res, next) => {
    let dayid = req.params.id
    let update = req.body.update;

    Day.findById(dayid)
        .then(day => {
            if (userCanAlter(day, req.user, res)) {
                return Day.findByIdAndUpdate(dayid, update)
                    .then(uday => res.send(uday))
            }
        }).catch(next)
}

module.exports = {
    newDay,
    viewDay,
    addLocationToDay,
    updateDay,
    dayBannerUpload
};
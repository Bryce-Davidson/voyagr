const Trip                  = require('../../../models/Trip/TripSchema');
const Day                   = require('../../../models/Day/DaySchema');
const User                  = require('../../../models/User/UserSchema');
const { 
    userCanAlter, 
    isOwner 
}                           = require('../../../util/local-functions/schemaValidationMethods');
const { TRIPBUCKET }        = require('../../../config/keys').AWS;
const upload                = require('../../../util/middleware/photo-upload-util');
const flatten               = require('flat');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// /trips ----------------------------------------------------------------

const getTrips = async function(req, res, next) {
    let { text, tags, min_budget, max_budget, paths, omit, pagenation} = req.query;
        let query = {};
        if(paths) {paths = paths.replace(/,/g, ' ')};
        if(omit) { omit = omit.split(',').map(item => `-${item}`).join(' ')};

        if (min_budget || max_budget) {
            const mb = query['budget.middleBound'] = {};
            if (min_budget) mb.$gte = min_budget;
            if (max_budget) mb.$lte = max_budget;
        }
        if (tags)   { query['meta.tags'] = { $all: tags.split(',') }} 
        if (text)   { query.$text = { $search: text } }

        Trip.find(query)
        .where({'settings.public': true})
        // can add paths hera that aren't in document and they will be ignored
        .select(paths)
        .select(omit)
        .limit(Number(pagenation))
        .then(docs => {
            delete query;
            return res.send(docs)
        }).catch(next)
}

const postTrip = async function(req, res, next) {
    let {name, description, tags, upperBound, lowerBound, public} = req.body;
    let newTrip = new Trip({
        user: req.user,
        name,
        description,
        meta: {tags},
        budget: {upperBound, lowerBound},
        settings: {public}
    })
    .save()
    .then(ntrip => res.status(201).send(ntrip))
    .catch(next)
}

// //trip/:id ?populate

const getTrip = async function(req, res, next) {
    let tripid = req.params.id;
    Trip.findById(tripid)
        .then(trip => {
            if(isOwner(trip, req.user))
                return res.send(trip)
            else if (!trip.settings.public) 
                return res.status(401).json({message: 'User Not Authorized'})
            trip.meta.viewCount = trip.meta.viewCount + 1;
            return trip
                .save()
                .then(utrip => {return res.send(utrip)})

        }).catch(next)
}


module.exports = {
    tripsRoot: {postTrip, getTrips},
    tripResource: {
        getTrip,
        // updateTrip,
        // likeTrip,
        // commentTrip,
        // changeDaysPublicStatus
    }
};
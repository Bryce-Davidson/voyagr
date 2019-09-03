const Trip                  = require('../../../models/Trip/TripSchema');
const Day                   = require('../../../models/Day/DaySchema');
const User                  = require('../../../models/User/UserSchema');
const { userCanAlter }      = require('../../../util/local-functions/schemaValidationMethods');
const { TRIPBUCKET }        = require('../../../config/keys').AWS;
const upload                = require('../../../util/middleware/photo-upload-util');
const flatten               = require('flat');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// = /root - /trips

const getTrips = async function(req, res, next) {
    let { text, tags, min_budget, max_budget, paths, omit} = req.query;
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

        console.log(query)
        console.log(paths)
        console.log(omit)

        Trip.find(query)
        // can add paths hera that aren't in document and they will be ignored
        .select(paths)
        .select(omit)
        .then(docs => {
            delete query;
            return res.send(docs)
        }).catch(next)
}

const postTrip = async function(req, res, next) {
    let {name, description, tags, upperBound, lowerBound} = req.body;
    let newTrip = new Trip({
        name,
        description,
        meta: {tags},
        budget: {upperBound, lowerBound}
    })
    .save()
    .then(ntrip => res.status(201).send(ntrip))
    .catch(next)
}


module.exports = {
    tripsRoot: {postTrip, getTrips},
    // tripResource: {
    //     updateTrip,
    //     likeTrip,
    //     commentTrip,
    //     changeDaysPublicStatus
    // }
};
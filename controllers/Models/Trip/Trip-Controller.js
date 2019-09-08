const Trip                          = require('../../../models/Trip/TripSchema');
const Day                           = require('../../../models/Day/DaySchema');
const User                          = require('../../../models/User/UserSchema');
const { 
    isOwner,
    keysContainString
}                                   = require('../../../util/local-functions/schemaValidationMethods');
const { TRIPBUCKET }                = require('../../../config/keys').AWS;
const upload                        = require('../../../util/middleware/photo-upload-util');
const flatten                       = require('flat');
const slugify                       = require('../../../util/local-functions/slugifyString');
const recursiveGenerateUniqueUrlid  = require('../../../util/local-functions/recursiveGenerateUniqueUrlid');
const shortid                       = require('shortid')

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// /trips ----------------------------------------------------------------

const getTrips = async function(req, res, next) {
    let { text, tags, min_budget, max_budget, paths, omit, pagenation} = req.query;
        let query = {};
        if (paths) { paths = paths.replace(/,/g, ' ') };
        if (omit)  { omit = omit.split(',').map(item => `-${item}`).join(' ') };
        if (tags)  { query['tags'] = { $all: tags.split(',') } }; 
        if (text)  { query.$text = { $search: text } };
        if (min_budget || max_budget) {
            const mb = query['budget.middleBound'] = {};
            if (min_budget) mb.$gte = min_budget;
            if (max_budget) mb.$lte = max_budget;
        };

        Trip.find(query)
        .where({'settings.public': true})
        .select(paths)
        .select(omit)
        .limit(Number(pagenation))
        .then(docs => {
            delete query;
            return res.send(docs)
        }).catch(next);
}

const postTrip = async function(req, res, next) {
    let {name, description, tags, upperBound, lowerBound, public} = req.body;
    let slug = slugify(name)

    
    // TODO:

    let uniqueid = recursiveGenerateUniqueUrlid(slug);
    new Trip({
        name,
        description,
        tags,
        meta: {upperBound, lowerBound, urlid: shortid.generate()},
        settings: {public}
    })
    .save()
    .then(ntrip => res.status(201).send(ntrip))
    .catch(next)
}

// //trips/:id ?populate

const getTrip = async function(req, res, next) {
    let tripid = req.params.id;
    Trip.findById(tripid)
        .then(trip => {
            if(!trip) return res.status(404).json({message: "Document does not exist."})
            if(isOwner(trip.user._id, req.user))
                return res.send(trip)
            else if (!trip.settings.public) 
                return res.status(401).json({message: 'User Not Authorized.'})
            trip.meta.viewCount = trip.meta.viewCount + 1;
            return trip
                .save()
                .then(utrip => {return res.send(utrip)})

        }).catch(next)
}

const getTripDays = async function(req, res, next) {
    let tripid = req.params.id;
    Trip.findById(tripid)
        .select('days name')
        .populate('days')
        .then(tripDays => {
            res.send(tripDays)
        })
}

const updateTrip = async function(req, res, next) {
    let tripid = req.params.id;
    let update = flatten(req.body);
    if(keysContainString('meta', update))
        return res.status(403).json({message: 'Unable to update on immutable path "meta".'})
    Trip.findById(tripid)   
        .then(trip => {
            if(!trip) return res.status(404).json({message: "Document does not exist."})
            if(isOwner(trip.user._id, req.user)) {
                return Trip.findByIdAndUpdate(tripid, update, {new: true})
                    .then(utrip => {
                        res.send(utrip)
                    })
            } else 
                return res.status(401).json({message: 'User Not Authorized.'});
        }).catch(next)
}

const deleteTrip = async function(req, res, next) {
    let tripid = req.params.id;
    Trip.findById(tripid)
        .then(trip => {
            if(!trip) return res.status(404).json({message: "Document does not exist."})
            if(isOwner(trip.user._id, req.user)) {
                return trip.remove()
                    .then(dtrip => {
                        return res.status(202).json({message: 'Document deleted succesfully.'})
                    })
            } else 
                return res.status(401).json({message: 'User Not Authorized.'});
        }).catch(next)
}

const addCommentTrip = async function () {

}

module.exports = {
    tripsRoot: {postTrip, getTrips},
    tripResource: {
        getTrip,
        getTripDays,
        updateTrip,
        deleteTrip
        // likeTrip,
        // commentTrip,
        // changeDaysPublicStatus
    }
};
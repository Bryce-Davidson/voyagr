const Trip                          = require('../../../models/Trip/TripSchema');
const Day                           = require('../../../models/Day/DaySchema');
const User                          = require('../../../models/User/UserSchema');
const { 
    isOwner,
    keysContainString
}                                   = require('../../../util/local-functions/instanceValidation');
// const { TRIPBUCKET }                = require('../../../config/keys').AWS;
const upload                        = require('../../../util/middleware/photo-upload-util');
const flatten                       = require('flat');

const ObjectId                      = require('mongoose').Types.ObjectId;
const shortid                       = require('shortid')
const recursiveGenerateUniqueUrlid  = require('../../../util/local-functions/recursiveGenerateUniqueUrlid');
const slugify                       = require('../../../util/local-functions/slugifyString');

const notExistMsg                   = require('../../../util/errors/notExistMsg');

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

    let uniqueid = await recursiveGenerateUniqueUrlid(slug)
    return new Trip({
        user: req.user,
        name,
        description,
        tags,
        meta: {upperBound, lowerBound, urlid: uniqueid},
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
            if (!trip) return notExistMsg('Trip', res)
            if (isOwner(trip, req.user))
                return res.send(trip)
            if (!trip.settings.public) 
                return res.status(401).json({msg: 'User Not Authorized.'})
            else return Trip.findByIdAndUpdate(tripid, { $inc: { 'meta.viewCount': 1 }})
                                .then(utrip => {return res.send(utrip)})
        })
        .catch(next)
}

const updateTrip = async function(req, res, next) {
    let tripid = req.params.id;
    let update = flatten(req.body);
    if (keysContainString('meta', update))
        return res.status(403).json({msg: 'Unable to update on immutable path "meta".'})
    else Trip.findById(tripid)   
            .then(trip => {
                if (!trip) return notExistMsg('Trip', res);
                if (isOwner(trip.user._id, req.user)) {
                return Trip.findByIdAndUpdate(tripid, update, {new: true})
                } 
                return res.status(401).json({msg: 'User Not Authorized.'});
            })
            .then(utrip => {return res.send(utrip)})
            .catch(next)
}

// add error message util

const deleteTrip = async function(req, res, next) {
    let tripid = req.params.id;
    try {
    let trip = await Trip.findById(tripid)
    if (!trip) return notExistMsg('Trip', res);
    if (isOwner(trip, req.user)) {
        await trip.remove();
        return res.status(200);
    } else 
        return res.status(401).json({msg: 'User Not Authorized.'});
    } catch (err) {
        next(err)
    }
}

const getTripDays = async function(req, res, next) {
    let tripid = req.params.id;
    try {
    let trip = await Trip.findById(tripid).populate('days')
    if (!trip) return notExistMsg('Trip', res);
    if (!trip.days) return res.status(404).json({msg: "Trip currently has 0 days"})
    else return res.send(trip.days)
    } catch (err) {
        next(err)
    }
}

const addDayToTrip = async function(req, res, next) {
    let tripid = req.params.id;
    let dayid  = req.query.dayid;
    if(!ObjectId.isValid(dayid))
        return res.status(422).json({msg: "Invalid day id."})
    try {    
    let dayToBeAdded = await Day.findById(dayid);
    if (!dayToBeAdded) return notExistMsg('Day', res);
    let tripToAddDayTo = await Trip.findById(tripid);
    if (!tripToAddDayTo) return notExistMsg('Trip', res);
    if (isOwner(tripToAddDayTo, req.user)) {
        let utrip = await Trip.findByIdAndUpdate(tripid, { $push: { days: dayid }}, {new: true})
        return res.send(utrip);
    } else 
        return res.status(401).json({msg: 'User Not Authorized.'})
    } catch (err) {
        next(err)
    }
}

const deleteDaysFromTrip = async function(req, res, next) {
    let tripid = req.params.id;
    let dayids = req.query.dayids.split(',');
    if (!dayids) return res.status(400).json({msg: 'Please Provide at least one days.'})
    dayids.forEach(id => {
        if (!ObjectId.isValid(id))
            return res.status(422).json({msg: "Invalid day id.", id})
    });

    try {
    let tripToModify = await Trip.findById(tripid);
    if (!tripToModify) return notExistMsg('Trip', res);
    if (isOwner(tripToModify, req.user)) {
        let tripWithDayRemoved = await Trip.findByIdAndUpdate(tripid, { $pullAll: { days: dayids } }, {new: true});
        return res.send(tripWithDayRemoved)
    } else 
        return res.status(401).json({msg: 'User Not Authorized.'})
    } catch (err) {
        next(err)
    }
}

module.exports = {
    tripsRoot: {postTrip, getTrips},
    tripResource: {
        getTrip,
        getTripDays,
        updateTrip,
        deleteTrip,
        addDayToTrip,
        deleteDaysFromTrip
        // likeTrip,
        // commentTrip,
        // changeDaysPublicStatus
    }
};
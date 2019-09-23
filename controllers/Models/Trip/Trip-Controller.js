const Trip = require('../../../models/Trip/TripSchema');
const Day = require('../../../models/Day/DaySchema');
const {
    isOwner,
    keysContainString
} = require('../../../util/auth/instance-validation');

const ObjectId = require('mongoose').Types.ObjectId;
const flatten = require('flat');
const recursiveGenerateUniqueUrlid = require('../../../util/database/generate-unique-urlid');
const slugify = require('../../../util/local-functions/slugify-string');

const notExistMsg = require('../../../util/http-response/resource-does-not-exist-msg');
const unauthorizedMsg = require('../../../util/http-response/unauthorized-msg');
const unableToUpdateImmutable = require('../../../util/http-response/unable-to-update-immutable');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()


// /trips ----------------------------------------------------------------

const getTrips = async function (req, res, next) {
    // TODO:[] integrate new api 
    let { text, tags, min_budget, max_budget, paths, omit, pagenation, featured_by } = req.query; 
}

const postTrip = async function (req, res, next) {
    let { name, description, tags, upperBound, lowerBound, public } = req.body;
    let slug = slugify(name);
    let uniqueid = await recursiveGenerateUniqueUrlid(slug, Trip);
    return new Trip({
        user: req.user,
        slug,
        name,
        description,
        tags,
        budget: { upperBound, lowerBound },
        meta: { urlid: uniqueid },
        settings: { public }
    })
        .save()
        .then(ntrip => res.status(201).send(ntrip))
        .catch(next);
}

// //trips/:id ?populate

const getTrip = async function (req, res, next) {
    let tripid = req.params.id;
    Trip.findById(tripid)
        .then(trip => {
            if (!trip) return notExistMsg('Trip', res);
            if (isOwner(trip, req.user))
                return res.send(trip);
            if (!trip.settings.public)
                return unauthorizedMsg(res);
            else return Trip.findByIdAndUpdate(tripid, { $inc: { 'meta.viewCount': 1 } })
                .then(utrip => { return res.send(utrip) });
        })
        .catch(next);
}

const updateTrip = async function (req, res, next) {
    let tripid = req.params.id;
    let update = flatten(req.body);
    if (update.name)
        update.slug = slugify(update.name);

    try {
        let tripTobeModified = await Trip.findById(tripid);
        if (!tripTobeModified) return notExistMsg('Trip', res);
        if (isOwner(tripTobeModified, req.user)) {
            let updatedTrip = await Trip.findByIdAndUpdate(tripid, update, { new: true });
            return res.send(updatedTrip);
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

// add error message util

const deleteTrip = async function (req, res, next) {
    let tripid = req.params.id;
    try {
        let trip = await Trip.findById(tripid);
        if (!trip) return notExistMsg('Trip', res);
        if (isOwner(trip, req.user)) {
            await trip.remove();
            return res.status(200).json({ msg: "Trip deleted succesfully" });
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

const getTripDays = async function (req, res, next) {
    let tripid = req.params.id;
    try {
        let trip = await Trip.findById(tripid).populate('days')
            .select('days')
            .select('-_id -user');
        if (!trip) return notExistMsg('Trip', res);
        if (!trip.days) return res.status(404).json({ msg: "Trip currently has 0 days" });
        else
            return res.send(trip.days);
    } catch (err) { next(err) };
}

const addDayToTrip = async function (req, res, next) {
    let tripid = req.params.id;
    let dayid = req.query.dayid;
    if (!ObjectId.isValid(dayid))
        return res.status(422).json({ msg: `Invalid day id: ${dayid}` });
    try {
        let dayToBeAdded = await Day.findById(dayid);
        if (!dayToBeAdded) return notExistMsg('Day', res);
        let tripToAddDayTo = await Trip.findById(tripid);
        if (!tripToAddDayTo) return notExistMsg('Trip', res);
        if (isOwner(tripToAddDayTo, req.user)) {
            let utrip = await Trip.findByIdAndUpdate(tripid, { $push: { days: dayid } }, { new: true });
            return res.send(utrip);
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

const deleteDaysFromTrip = async function (req, res, next) {
    let tripid = req.params.id;
    let dayids = req.query.dayids.split(',');
    //TODO:[] Replace dayid in query with urlid
    if (!dayids) return res.status(400).json({ msg: 'Please Provide at least one days.' });
    dayids.forEach(id => {
        if (!ObjectId.isValid(id))
            return res.status(422).json({ msg: "Invalid day id.", id });
    });

    try {
        let tripTobeModified = await Trip.findById(tripid);
        if (!tripTobeModified) return notExistMsg('Trip', res);
        if (isOwner(tripTobeModified, req.user)) {
            let tripWithDayRemoved = await Trip.findByIdAndUpdate(tripid, { $pullAll: { days: dayids } }, { new: true });
            return res.send(tripWithDayRemoved);
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

const changeDaysPublicStatus = async function (req, res, next) {
    //TODO:[] Invoke child status change instance method
}

const getTripLikes = async function (req, res, next) {
    let tripid = req.params.id;
    try {
        let trip = await Trip.findById(tripid).populate('likes')
            .select('likes')
            .select('-_id -user');
        if (!trip) return notExistMsg('trip', res);
        if (!trip.likes) return res.status(404).json({ msg: "Trip currently has 0 likes" });
        else
            return res.send(trip.likes);
    } catch (err) { next(err) };
}

const likeTrip = async function (req, res, next) {
    Trip.findByIdAndUpdate(req.params.id, {
        $inc: { 'meta.likes': 1 }
    }, { new: true })
        .then(likedDay => res.send(likedDay))
        .catch(next)
}

const getTripComments = async function (req, res, next) {
    let tripid = req.params.id;
    try {
        let trip = await Trip.findById(tripid).populate('comments')
            .select('comments')
            .select('-_id -user');
        if (!trip) return notExistMsg('trip', res);
        if (!trip.comments) return res.status(404).json({ msg: "Trip currently has 0 comments" });
        else
            return res.send(trip.comments);
    } catch (err) { next(err) };
}

const postCommentTrip = async function (req, res, next) {
    let postid = req.params.id;
    let comment = new Comment({
        'tripid': postid,
        "user": req.user,
        "body": req.body.body
    });
    comment.save()
        .then(comment => {
            return Trip.findByIdAndUpdate(req.params.id, {
                $inc: { 'meta.numberOfComments': 1 },
                $push: { comments: comment._id }
            }, { new: true })
                .then(tripWithComment => res.send(tripWithComment))
        }).catch(next)
}

module.exports = {
    tripsRoot: {
        getTrips,
        postTrip
    },
    tripResource: {
        getTrip,
        updateTrip,
        deleteTrip,
        getTripDays,
        addDayToTrip,
        deleteDaysFromTrip,
        deleteTrip
    },
    tripMeta: {
        likeTrip,
        postCommentTrip,
        getTripLikes,
        getTripComments,
        changeDaysPublicStatus
    }
};
const Trip = require('../../../models/Trip/TripSchema');
const Day = require('../../../models/Day/DaySchema');
const User = require('../../../models/User/UserSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const { isOwner } = require('../../../util/auth/instance-validation');

const ObjectId = require('mongoose').Types.ObjectId;
const flatten = require('flat');
const recursiveGenerateUniqueUrlid = require('../../../util/database/generate-unique-urlid');
const slugify = require('../../../util/local-functions/slugify-string');
const generateUpdate = require('../../../util/local-functions/quarantine-update');

const resourceDoesNotExistMsg = require('../../../util/http-response/resource-does-not-exist-msg');
const unauthorizedMsg = require('../../../util/http-response/unauthorized-msg');

const Pipeline = require('../../../modules/aggregation/pipeline-queue');
const {
    trip_Project,
    trip_Match,
    trip_Featured,
    trip_Limit
} = require('../../../modules/aggregation/Trip/trip-stages')

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// /trips ----------------------------------------------------------------

const getTrips = async function (req, res, next) {
    let { text, tags, min_budget, max_budget, paths, omit, pagenation, featured_by, sort_by } = req.query;
    let limit = Number(pagenation) || 15;
    try {
        let pipe = new Pipeline();
        let match_stage = new trip_Match()
            .text(text)
            .tags(tags)
            .budget(min_budget, max_budget)
        let project_stage = new trip_Project()
            .paths(paths)
            .omit(omit)
        let featured_stage = new trip_Featured(null, -1).by(featured_by)
        let limit_stage = new trip_Limit(null, limit)
        pipe.enqueue_many(match_stage, project_stage, featured_stage, limit_stage)
        let docs = await Trip.aggregate(pipe.pipeline);
        return res.send(docs);
    } catch (err) { next(err) }
}

const postTrip = async function (req, res, next) {
    let { name, description, tags, upperBound, lowerBound, public, currency } = req.body;
    let slug = await slugify(name);
    try {
        let uniqueid = await recursiveGenerateUniqueUrlid(slug, Trip);
        let saved_trip = await new Trip({
            user: req.user,
            slug,
            name,
            description,
            tags,
            budget: { upperBound, lowerBound, currency },
            meta: { urlid: uniqueid },
            settings: { public }
        }).save();
        await User.findByIdAndUpdate(req.user, { $push: { 'posts.trips': saved_trip._id } })
        return res.status(201).send(saved_trip);
    } catch (err) { next(err) }
}

// //trips/:id ?populate

const getTrip = async function (req, res, next) {
    let tripid = req.params.id;
    try {
        let trip = await Trip.findById(tripid);
        if (!trip) return resourceDoesNotExistMsg('Trip', res);
        if (isOwner(trip, req.user))
            return res.send(trip);
        if (!trip.settings.public)
            return unauthorizedMsg(res);
        else {
            let tripWithNewView = await Trip.findByIdAndUpdate(tripid, { $inc: { 'meta.viewCount': 1 } }, { new: true });
            return res.send(tripWithNewView);
        }
    } catch (err) { next(err) }
}

const updateTrip = async function (req, res, next) {
    let tripid = req.params.id;
    let update = flatten(req.body);
    try {
        update = await generateUpdate(update);
        if (update.name) {
            updatedSlug = await slugify(update.name);
            update.slug = updatedSlug;
        };
        let tripTobeModified = await Trip.findById(tripid);
        if (!tripTobeModified) return resourceDoesNotExistMsg('Trip', res);
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
        if (!trip) return resourceDoesNotExistMsg('Trip', res);
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
        if (!trip) return resourceDoesNotExistMsg('Trip', res);
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
        if (!dayToBeAdded) return resourceDoesNotExistMsg('Day', res);
        let tripToAddDayTo = await Trip.findById(tripid);
        if (!tripToAddDayTo) return resourceDoesNotExistMsg('Trip', res);
        if (isOwner(tripToAddDayTo, req.user)) {
            let utrip = await Trip.findByIdAndUpdate(tripid, { $push: { days: dayid } }, { new: true });
            await Day.findByIdAndUpdate(dayid, { $push: { trips: tripid } });
            return res.send(utrip);
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

const deleteDaysFromTrip = async function (req, res, next) {
    let tripid = req.params.id;
    let dayids = req.query.dayids.split(',');
    if (!dayids) return res.status(400).json({ msg: 'Please Provide at least one days.' });
    dayids.forEach(id => {
        if (!ObjectId.isValid(id))
            return res.status(422).json({ msg: "Invalid day id.", id });
    });

    try {
        let tripTobeModified = await Trip.findById(tripid);
        if (!tripTobeModified) return resourceDoesNotExistMsg('Trip', res);
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
        if (!trip) return resourceDoesNotExistMsg('trip', res);
        if (!trip.likes) return res.status(404).json({ msg: "Trip currently has 0 likes" });
        else
            return res.send(trip.likes);
    } catch (err) { next(err) };
}

const likeTrip = async function (req, res, next) {
    let userid = req.user;
    let tripid = req.params.id
    try {
        let trip_to_be_liked = await Trip.findById(tripid);
        if (!trip_to_be_liked) return resourceDoesNotExistMsg('Trip', res);
        let userHasLiked = (~trip_to_be_liked.meta.userLikeReference.indexOf(String(userid)))
        if (isOwner(trip_to_be_liked, req.user) || userHasLiked)
            return res.send(trip_to_be_liked)
        let liked_trip_with_new_reference = await Trip.findByIdAndUpdate(tripid, {
            $inc: { 'meta.numberOflikes': 1 },
            $push: { 'meta.userLikeReference': userid }
        },
            { new: true })
        return res.send(liked_trip_with_new_reference);
    } catch (err) { next(err) }
}

const deleteLikeTrip = async function(req, res, next) {
    let userid = req.user;
    let tripid = req.params.id
    try {
        let trip_to_be_unliked = await Trip.findById(tripid);
        if (!trip_to_be_unliked) return resourceDoesNotExistMsg('Trip', res);
        let userHasLiked = (~trip_to_be_unliked.meta.userLikeReference.indexOf(String(userid)))
        if (isOwner(trip_to_be_unliked, req.user) || !userHasLiked)
            return res.send(trip_to_be_unliked)
        let unliked_trip_without_user_reference = await Trip.findByIdAndUpdate(tripid, {
            $inc: { 'meta.numberOflikes': -1 },
            $pull: { 'meta.userLikeReference': userid }
        },
            { new: true })
        return res.send(unliked_trip_without_user_reference);
    } catch (err) { next(err) }
}

const getTripComments = async function (req, res, next) {
    let tripid = req.params.id;
    try {
        let trip = await Trip.findById(tripid).populate('comments')
            .select('comments')
            .select('-_id -user');
        if (!trip) return resourceDoesNotExistMsg('trip', res);
        if (!trip.comments) return res.status(404).json({ msg: "Trip currently has 0 comments" });
        else
            return res.send(trip.comments);
    } catch (err) { next(err) };
}

const postCommentTrip = async function (req, res, next) {
    let postid = req.params.id;
    let { commentBody, title } = req.body;
    try {
        let savedComment = await new Comment({
            'tripid': postid,
            "user": req.user,
            "body": commentBody,
            title
        }).save();
        let tripWithComment = await Trip.findByIdAndUpdate(req.params.id, {
            $inc: { 'meta.numberOfComments': 1 },
            $push: { comments: savedComment._id }
        }, { new: true });
        return res.status(201).send(tripWithComment)
    } catch (err) { next(err) };
}

const deleteCommentTrip = async function (req, res, next) {
    let postid = req.params.id;
    let commentid = req.query.commentid;
    try {
        let tripWithCommentRemoved = await Trip.findByIdAndUpdate(postid, {
            $pull: { comments: commentid },
            $inc: { 'meta.numberOfComments': -1 }
        },
            { new: true });
        await Comment.findByIdAndDelete(commentid);
        return res.send(tripWithCommentRemoved);
    } catch (err) { next(err) };
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
        deleteLikeTrip,
        getTripComments,
        deleteCommentTrip,
        changeDaysPublicStatus
    }
};
const User = require('../../../models/User/UserSchema');
const Day = require('../../../models/Day/DaySchema');
const Location = require('../../../models/Location/LocationSchema');
const ObjectId = require('mongoose').Types.ObjectId;
const Comment = require('../../../models/Comment/CommentSchema');

const unauthorizedMsg = require('../../../util/http-response/unauthorized-msg');

const slugify = require('../../../util/local-functions/slugify-string')
const recursiveGenerateUniqueUrlid = require('../../../util/database/generate-unique-urlid');
const generateUpdate = require('../../../util/local-functions/quarantine-update');
const flatten = require('flat');

const { isOwner } = require('../../../util/auth/instance-validation');

const {
    day_Project,
    day_Match,
    day_Featured,
    day_Limit
} = require('../../../modules/aggregation/Day/day-stages');

const Pipeline = require('../../../modules/aggregation/pipeline-queue')

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

// TODO: integrate sort api into the find all functionality

const getDays = async function (req, res, next) {
    let { text, tags, min_budget, max_budget, paths, omit, pagenation, featured_by, sort_by  } = req.query;
    let limit = Number(pagenation) || 15;
    try {
        let pipe = new Pipeline();
        let match_stage = new day_Match()
            .text(text)
            .tags(tags)
            .budget(min_budget, max_budget)
        let project_stage = new day_Project()
            .paths(paths)
            .omit(omit)
        let featured_stage  = new day_Featured(null, -1).by(featured_by)
        let limit_stage  = new day_Limit(null, limit)
        pipe.enqueue_many(match_stage, project_stage, featured_stage , limit_stage )
        let docs = await Day.aggregate(pipe.pipeline);
        return res.send(docs);
    } catch (err) { next(err) }
}

const postDay = async function (req, res, next) {
    let { name, description, tags, upperBound, lowerBound, public, currency } = req.body;
    let slug = await slugify(name);
    try {
        let uniqueid = await recursiveGenerateUniqueUrlid(slug, Day);
        let saved_day = await new Day({
            user: req.user,
            slug,
            name,
            description,
            tags,
            budget: {upperBound, lowerBound, currency},
            meta: { urlid: uniqueid },
            settings: { public }
        }).save();
        await User.findByIdAndUpdate(req.user, {posts: {trips: saved_day._id}})
        res.status(201).send(saved_day);
    } catch (err) { next(err) }
}

const getDay = async function (req, res, next) {
    let dayid = req.params.id;
    try {
        let day = await Day.findById(dayid);
        if (!day) return resourceDoesNotExistMsg('day', res);
        if (isOwner(day, req.user))
            return res.send(day);
        if (!day.settings.public)
            return unauthorizedMsg(res);
        else {
            let dayWithNewView = await Day.findByIdAndUpdate(dayid, { $inc: { 'meta.viewCount': 1 } }, {new:true});
            return res.send(dayWithNewView);
        }
    } catch (err) { next(err) }
}

const updateDay = async function (req, res, next) {
    let dayid = req.params.id;
    let update = flatten(req.body);
    try {
        update = await generateUpdate(update);
        if (update.name) {
            updatedSlug = await slugify(update.name);
            update.slug = updatedSlug;
        };
        let dayTobeModified = await Day.findById(dayid);
        if (!dayTobeModified) return notExistMsg('Day', res);
        if (isOwner(dayTobeModified, req.user)) {
            let updatedday = await Day.findByIdAndUpdate(dayid, update, { new: true });
            return res.send(updatedday);
        } else
            return unauthorizedMsg(res);
    } catch (err) {
        if (err.code === 'Immutable')
            return res.status(err.code).json(err.msg)
        else
            next(err)
    };
}

const deleteDay = async function (req, res, next) {
    let dayid = req.params.id;
    try {
        let day = await Day.findById(dayid);
        if (!day) return notExistMsg('Day', res);
        if (isOwner(day, req.user)) {
            await day.remove();
            return res.status(200).json({ msg: "Day deleted succesfully" });
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

const getDayLocations = async function (req, res, next) {
    let dayid = req.params.id;
    try {
        let day = await Day.findById(dayid).populate('locations');
        if (!day) return notExistMsg('Day', res);
        if (!day.locations) return res.status(404).json({ msg: "day currently has 0 locations" });
        else
            return res.send(day.locations);
    } catch (err) { next(err) };
}

const addLocationToDay = async function (req, res, next) {
    let dayid = req.params.id;
    let locationid = req.query.locationid;
    if (!ObjectId.isValid(locationid))
        return res.status(422).json({ msg: `Invalid location id: ${locationid}` });
    try {
        let locationToBeAdded = await Location.findById(locationid);
        if (!locationToBeAdded) return notExistMsg('Location', res);
        let dayToAddlocationTo = await Day.findById(dayid);
        if (!dayToAddlocationTo) return notExistMsg('Day', res);
        if (isOwner(dayToAddlocationTo, req.user)) {
            let dayWithLocationAdded = await Day.findByIdAndUpdate(dayid, { $push: { locations: locationid } }, { new: true });
            await Location.findByIdAndUpdate(locationid, {$push: { days: dayid }});
            return res.send(dayWithLocationAdded);
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

const deleteLocationsFromDay = async function (req, res, next) {
    let dayid = req.params.id;
    if (!req.query.locationids) return res.status(400).json({ msg: 'Please Provide at least one locations.' });
    let locationids = req.query.locationids.split(',');
    locationids.forEach(id => {
        if (!ObjectId.isValid(id))
            return res.status(422).json({ msg: "Invalid location id.", id });
    });

    try {
        let dayTobeModified = await Day.findById(dayid);
        if (!dayTobeModified) return notExistMsg('Day', res);
        if (isOwner(dayTobeModified, req.user)) {
            let dayWithlocationRemoved = await Day.findByIdAndUpdate(dayid, { $pullAll: { locations: locationids } }, { new: true });
            return res.send(dayWithlocationRemoved);
        } else
            return unauthorizedMsg(res);
    } catch (err) { next(err) };
}

const getDayLikes = async function (req, res, next) {
    let dayid = req.params.id;
    try {
        let day = await Day.findById(dayid).populate('likes')
            .select('likes')
            .select('-_id -user');
        if (!day) return notExistMsg('Day', res);
        if (!day.likes) return res.status(404).json({ msg: "Day currently has 0 likes" });
        else
            return res.send(day.likes);
    } catch (err) { next(err) };
}

const likeDay = async function (req, res, next) {
    let userid = req.user;
    let dayid = req.params.id
    try {
        let day_to_be_liked = await Day.findById(dayid);
        if (!day_to_be_liked) return resourceDoesNotExistMsg('day', res);
        let userHasLiked = (~day_to_be_liked.meta.userLikeReference.indexOf(String(userid)))
        if (isOwner(day_to_be_liked, req.user) || userHasLiked)
            return res.send(day_to_be_liked)
        let liked_day_with_new_reference = await Day.findByIdAndUpdate(dayid, {
            $inc: { 'meta.numberOflikes': 1 },
            $push: { 'meta.userLikeReference': userid }
        },
            { new: true })
        return res.send(liked_day_with_new_reference);
    } catch (err) { next(err) }
}

const deleteLikeday = async function(req, res, next) {
    let userid = req.user;
    let dayid = req.params.id
    try {
        let day_to_be_unliked = await Day.findById(dayid);
        if (!day_to_be_unliked) return resourceDoesNotExistMsg('day', res);
        let userHasLiked = (~day_to_be_unliked.meta.userLikeReference.indexOf(String(userid)))
        if (isOwner(day_to_be_unliked, req.user) || !userHasLiked)
            return res.send(day_to_be_unliked)
        let unliked_day_without_user_reference = await Day.findByIdAndUpdate(dayid, {
            $inc: { 'meta.numberOflikes': -1 },
            $pull: { 'meta.userLikeReference': userid }
        },
            { new: true })
        return res.send(unliked_day_without_user_reference);
    } catch (err) { next(err) }
}

const getDayComments = async function (req, res, next) {
    let dayid = req.params.id;
    try {
        let day = await Day.findById(dayid).populate('comments')
            .select('comments')
            .select('-_id -user');
        if (!day) return notExistMsg('Day', res);
        if (!day.comments) return res.status(404).json({ msg: "Day currently has 0 comments" });
        else
            return res.send(day.comments);
    } catch (err) { next(err) };
}

const postCommentDay = async function (req, res, next) {
    let postid = req.params.id;
    let comment = new Comment({
        'dayid': postid,
        "user": req.user,
        "body": req.body.body
    });
    try {
        let savedComment = await comment.save();
        let dayWithComment = await Day.findByIdAndUpdate(req.params.id, {
            $inc: { 'meta.numberOfComments': 1 },
            $push: { comments: savedComment._id }
        }, { new: true })
        return res.send(dayWithComment)
    } catch(err) { next(err) }
}

const deleteCommentDay = async function (req, res, next) {
    let postid = req.params.id;
    let commentid = req.query.commentid;
    try {
        let dayWithCommentRemoved = await Day.findByIdAndUpdate(postid, { 
            $pull: { comments: commentid }, 
            $inc: {'meta.numberOfComments': -1}}, 
            {new: true});
        await Comment.findByIdAndDelete(commentid);
        return res.send(dayWithCommentRemoved);
    } catch (err) { next(err) };
}

module.exports = {
    daysRoot: {
        getDays,
        postDay
    },
    dayResource: {
        getDay,
        updateDay,
        deleteDay,
        getDayLocations,
        addLocationToDay,
        deleteLocationsFromDay,
        deleteDay
    },
    dayMeta: {
        likeDay,
        deleteLikeday,
        postCommentDay,
        getDayComments,
        deleteCommentDay,
        getDayLikes
    }
};
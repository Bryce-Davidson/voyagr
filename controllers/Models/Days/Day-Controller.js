const User = require('../../../models/User/UserSchema');
const Day = require('../../../models/Day/DaySchema');
const Location = require('../../../models/Location/LocationSchema');
const { isOwner } = require('../../../util/auth/instance-validation');
const flatten = require('flat');

const ObjectId = require('mongoose').Types.ObjectId;

const slugify = require('../../../util/local-functions/slugify-string')
const recursiveGenerateUniqueUrlid = require('../../../util/database/generate-unique-urlid');

const {
    day_Project,
    day_Match,
    day_Featured,
    day_Limit
} = require('../../../modules/aggregation/Day/day-stages');

const Pipeline = require('../../../modules/aggregation/pipeline-queue')

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

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
    } catch (err) { next(err) }}

const postDay = async function (req, res, next) {
    let { name, description, tags, upperBound, lowerBound, public, currency } = req.body;
    let slug = slugify(name);
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
        let dayToSend = await Day.findById(dayid);
        if (!dayToSend) return notExistMsg('Day', res);
        if (isOwner(dayToSend, req.user))
            return res.send(dayToSend);
        if (!dayToSend.settings.public)
            return unauthorizedMsg(res);
        else return Day.findByIdAndUpdate(dayid, { $inc: { 'meta.viewCount': 1 } })
            .then(uday => { return res.send(uday) });
    } catch (err) { next(err) }
}

const updateDay = async function (req, res, next) {
    let dayid = req.params.id;
    let update = flatten(req.body);
    if (update.name)
        update.slug = slugify(update.name);

    try {
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
    let locationids = req.query.locationids.split(',');
    if (!locationids) return res.status(400).json({ msg: 'Please Provide at least one locations.' });
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
    Day.findByIdAndUpdate(req.params.id, {
        $inc: { 'meta.likes': 1 }
    }, { new: true })
        .then(likedPost => res.send(likedPost))
        .catch(next)
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
    comment.save()
        .then(comment => {
            return Day.findByIdAndUpdate(req.params.id, {
                $inc: { 'meta.numberOfComments': 1 },
                $push: { comments: comment._id }
            }, { new: true })
                .then(dayWithComment => res.send(dayWithComment))
        }).catch(next)
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
        postCommentDay,
        getDayComments,
        getDayLikes
    }
};
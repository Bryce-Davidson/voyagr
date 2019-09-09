const User = require('../../../models/User/UserSchema');
const Day = require('../../../models/Day/DaySchema');
const { isOwner } = require('../../../util/local-functions/instance-validation');
// const { DAYBUCKET }     = require('../../../config/keys').AWS;
const upload = require('../../../util/middleware/photo-upload-util');
const flatten = require('flat');

const slugify                       = require('../../../util/local-functions/slugify-string')
const quarantineUpdate              = require('../../../util/local-functions/quarantine-update');
const recursiveGenerateUniqueUrlid  = require('../../../util/local-functions/generate-unique-urlid');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const getDays = async function (req, res, next) {
    let { text, tags, min_budget, max_budget, paths, omit, pagenation } = req.query;
    let query = {};
    if (paths) { paths = paths.replace(/,/g, ' ') };
    if (omit) { omit = omit.split(',').map(item => `-${item}`).join(' ') };
    if (tags) { query['tags'] = { $all: tags.split(',') } };
    if (text) { query.$text = { $search: text } };
    if (min_budget || max_budget) {
        const mb = query['budget.middleBound'] = {};
        if (min_budget) mb.$gte = min_budget;
        if (max_budget) mb.$lte = max_budget;
    };

    Day.find(query)
        .where({ 'settings.public': true })
        .select(paths)
        .select(omit)
        .limit(Number(pagenation))
        .then(docs => {
            delete query;
            return res.send(docs);
        }).catch(next);
}

const postDay = async function (req, res, next) {
    let { name, description, tags, upperBound, lowerBound, public } = req.body;
    let slug = slugify(name);
    let uniqueid = await recursiveGenerateUniqueUrlid(slug, Day);
    return new Day({
        user: req.user,
        slug,
        name,
        description,
        tags,
        meta: { upperBound, lowerBound, urlid: uniqueid },
        settings: { public }
    })
        .save()
        .then(ntrip => res.status(201).send(ntrip))
        .catch(next);
}

const getDay = async function (req, res, next) {
    let dayid = req.params.id;
    Day.findById(dayid)
        .then(day => {
            if (!day) return notExistMsg('Day', res);
            if (isOwner(day, req.user))
                return res.send(day);
            if (!day.settings.public)
                return unauthorizedMsg(res);
            else return Day.findByIdAndUpdate(dayid, { $inc: { 'meta.viewCount': 1 } })
                .then(uday => { return res.send(uday) });
        })
        .catch(next);
}

const updateDay = async function (req, res, next) {
    let dayid = req.params.id;
    let update = flatten(req.body);
    if (update.name)
        update.slug = slugify(update.name);

    try {
        update = await quarantineUpdate(update);
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
            return res.status(200);
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
        let dayToAddlocationTo = await day.findById(dayid);
        if (!dayToAddlocationTo) return notExistMsg('Day', res);
        if (isOwner(dayToAddlocationTo, req.user)) {
            let dayWithLocationAdded = await day.findByIdAndUpdate(dayid, { $push: { locations: locationid } }, { new: true });
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
        deleteLocationsFromDay
    },
    dayMeta: {

    }
};
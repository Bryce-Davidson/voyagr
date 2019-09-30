const Location = require('../../../models/Location/LocationSchema');
const User = require('../../../models/User/UserSchema');
const { isOwner } = require('../../../util/auth/instance-validation');

const recursiveGenerateUniqueUrlid = require('../../../util/database/generate-unique-urlid');
const slugify = require('../../../util/local-functions/slugify-string');

const flatten = require('flat');

const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const getLocations = async function (req, res, next) {
  //TODO: integrate new api
}

const postLocation = async function (req, res, next) {
  const { coordinates, name, tags, upperBound, lowerBound, type } = req.body
  let slug = await slugify(name);
  coordinates.reverse();
  let uniqueid = await recursiveGenerateUniqueUrlid(slug, Location);

  let saved_location = new Location({
    "name": name,
    "slug": slug,
    "user": req.user,
    "typeOfLocation": type,
    "location": {
      "type": "Point",
      "coordinates": coordinates
    },
    "tags": tags,
    "meta": { urlid: uniqueid },
    "budget": { upperBound, lowerBound }
  }).save();
  await User.findByIdAndUpdate(req.user, {posts: {locations: saved_location._id}})
  return res.send(saved_trip)
}

const getLocation = async function (req, res, next) {
  let locationid = req.params.id;
  try {
    let locationToSend = await Location.findById(locationid);
    if (!locationToSend) return notExistMsg('Location', res);
    if (isOwner(locationToSend, req.user))
      return res.send(locationToSend);
    if (!locationToSend.settings.public)
      return unauthorizedMsg(res);
    else {
      let updatdLocation = Location.findByIdAndUpdate(locationid, { $inc: { 'meta.viewCount': 1 } })
      return res.send(updatdLocation);
    }
  } catch (err) { next(err) }
}

const updateLocation = async function (req, res, next) {
  let locationid = req.params.id;
  let update = flatten(req.body);
  try {
    if (update.name)
      update.slug = await slugify(update.name);

    let locationTobeModified = await Location.findById(locationid);
    if (!locationTobeModified) return notExistMsg('Location', res);
    if (isOwner(locationTobeModified, req.user)) {
      let updatedlocation = await Location.findByIdAndUpdate(locationid, update, { new: true });
      return res.send(updatedlocation);
    } else
      return unauthorizedMsg(res);
  } catch (err) {
    if (err.code === 'Immutable')
      return res.status(err.code).json(err.msg)
    else
      next(err)
  };
}

const deleteLocation = async function (req, res, next) {
  let locationid = req.params.id;
  try {
    let location = await Location.findById(locationid);
    if (!location) return notExistMsg('Location', res);
    if (isOwner(location, req.user)) {
      await location.remove();
      return res.status(200);
    } else
      return unauthorizedMsg(res);
  } catch (err) { next(err) };
}

const likeLocation = async function (req, res, next) {
  let likedLocation = await Location.findByIdAndUpdate(req.params.id, {
    $inc: { 'meta.likes': 1 }
  }, { new: true });
  return res.send(likeLocation);
}

const commentLocation = async function (req, res, next) {
  let postid = req.params.id;
  let comment = new Comment({
    'locationid': postid,
    "user": req.user,
    "body": req.body.body
  });
  try {
    let savedComment = await comment.save();
    let locationWithComment = await Location.findByIdAndUpdate(req.params.id, {
      $inc: { 'meta.numberOfComments': 1 },
      $push: { comments: savedComment._id }
    }, { new: true });
    return res.send(locationWithComment)
  } catch (err) { next(err) }
}

module.exports = {
  LocationsRoot: {
    getLocations,
    postLocation
  },
  LocationResource: {
    getLocation,
    updateLocation,
    deleteLocation
  },
  LocationMeta: {
    likeLocation,
    commentLocation
  }
};
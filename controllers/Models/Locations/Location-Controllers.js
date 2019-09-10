const Location          = require('../../../models/Location/LocationSchema');
const User              = require('../../../models/User/UserSchema');
const { isOwner }       = require('../../../util/local-functions/instance-validation');

const recursiveGenerateUniqueUrlid    = require('../../../util/local-functions/generate-unique-urlid');
const slugify                         = require('../../../util/local-functions/slugify-string');
const quarantineUpdate                = require('../../../util/local-functions/quarantine-update');


const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const getLocations = async function (req, res, next) {
  // &near=distance:1000@lat,long -> near=distance:1000@127.4421,41.2345

  // TODO: 
  // combine text and geo indexes

  let { near, tags, text, min_budget, max_budget, paths, omit, pagenation } = req.query;
  let query = {};
  if (paths) { paths = paths.replace(/,/g, ' ') };
  if (omit) { omit = omit.split(',').map(item => `-${item}`).join(' ') };
  if (tags) { query['meta.tags'] = { $all: tags.split(',') } }
  if (text) { query.$text = { $search: text } }
  if (min_budget || max_budget) {
    const mb = query['budget.middleBound'] = {};
    if (min_budget) mb.$gte = min_budget;
    if (max_budget) mb.$lte = max_budget;
  }
  if (near && text)
    return res.status(405).send('Near cannot be combined with text, use tags to specify attributes')
  if (near) {
    let maxDistance = near.substring(near.indexOf(':') + 1, near.indexOf('@'))
    // G: [lat, long], N: [long, lat]
    let coordinates = near.substring(near.indexOf('@') + 1).split(',').reverse()
    query.location = { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: maxDistance } }
  }

  Location.find(query)
    .where({ 'settings.public': true })
    .select(paths)
    .select(omit)
    .limit(Number(pagenation))
    .then(docs => {
      delete query;
      return res.send(docs);
    }).catch(next);
}

const postLocation = async function (req, res, next) {
  const { coordinates, name, tags, upperBound, lowerBound } = req.body
  let slug = slugify(name);
  // G: [lat, long], N: [long, lat]
  coordinates.reverse();
  let uniqueid = await recursiveGenerateUniqueUrlid(slug, Location);

  new Location({
    "name": name,
    "slug": slug,
    "user": req.user,
    "location": {
      "type": "Point",
      "coordinates": coordinates
    },
    "meta": { tags, urlid: uniqueid },
    "budget": { upperBound, lowerBound }
  })
    .save()
    .then(loc => {
      return res.send(loc)
    })
    .catch(next)
}

const getLocation = async function(req, res, next) {
  let locationid = req.params.id;
  try {
  let locationToSend = await Location.findById(locationid);
  if (!locationToSend) return notExistMsg('Location', res);
  if (isOwner(locationToSend, req.user))
      return res.send(locationToSend);
  if (!locationToSend.settings.public)
      return unauthorizedMsg(res);
  else return Location.findByIdAndUpdate(locationid, { $inc: { 'meta.viewCount': 1 } })
      .then(ulocation => { return res.send(ulocation) });
  
  } catch(err) { next(err) } 
} 
const updateLocation = async function(req, res, next) {
  let locationid = req.params.id;
    let update = flatten(req.body);
    if (update.name)
        update.slug = slugify(update.name);

    try {
        update = await quarantineUpdate(update);
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
const deleteLocation = async function(req, res, next) {
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

const likeLocation = async function(req, res, next) {

}
const commentLocation = async function(req, res, next) {

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
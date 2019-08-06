const Location = require('../../../models/Location/LocationSchema')

// /Locations

// find all locations near a coordinate point
const findNear = (req, res, next) => {
  var { coordinates, maxDistance } = req.body;

  Location.find().nearPoint(coordinates, maxDistance)
      .then(data => res.send(data))
      .catch(next)
};

// find a list of locations with most the most views and most comments
const featuredLocations = (req, res, next) => {
  const pagenation = parseInt(req.query.pagenation);

  Location.find({}).sort({'meta.view_count': -1}).limit(pagenation)
    .then(data => res.send(data))
    .catch(next)
};

// POST
const newLocation = (req, res, next) => {
  const {coordinates, name } = req.body
  // SWITCH from [lat, long] to [long, lat] for mongo
  coordinates.reverse();
  Location.create({
    "name": name,
    "location": {
      "type": "Point",
      "coordinates": coordinates
    },
  })
  .then(location => res.send(location))
  .catch(next)
}

module.exports = { findNear, newLocation, featuredLocations }
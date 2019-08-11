const Location = require('../../../models/Location/LocationSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const User = require('../../../models/User/UserSchema');

// SEARCH -----------------------------------------------------------------------

const findNear = (req, res, next) => {
  var { coordinates, maxDistance } = req.body;

  Location.find().nearPoint(coordinates, maxDistance)
      .then(data => res.send(data))
      .catch(next)
};

// featured?pagenation=NUMBER
const featuredLocations = (req, res, next) => {
  const pagenation = parseInt(req.query.pagenation);
  Location.find({}).sort({'meta.view_count': -1, 'meta.numberOfComments': -1, 'meta.likes': -1}).limit(pagenation)
    .then(data => res.send(data))
    .catch(next)
};

// GET --------------------------------------------------------------------------

// locations/:id
const viewLocation = (req, res, next) => {
  Location.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
    .populate('comments')
    .then(data => {
      res.send((data));
    })
    .catch(next)
};

// POST -------------------------------------------------------------------------

const newLocation = (req, res, next) => {
  const {coordinates, name } = req.body
  let userid = req.session.passport.user;
  // SWITCH from [lat, long] to [long, lat] for mongo
  coordinates.reverse();
  Location.create({
    "name": name,
    "user": userid,
    "location": {
      "type": "Point",
      "coordinates": coordinates
    },
  })
  .then(location => {
      return User.findByIdAndUpdate(userid, {
        $push: {'posts.locations': location._id}
    })
    .then(user => res.send(location))
  })
  .catch(next)
}

module.exports = { 
  findNear, 
  newLocation, 
  featuredLocations, 
  viewLocation
}
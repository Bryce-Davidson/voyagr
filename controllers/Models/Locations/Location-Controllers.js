const Location = require('../../../models/Location/LocationSchema');
const Comment = require('../../../models/Comment/CommentSchema');

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

// locations/:id/addcomment
const addComment = (req, res, next) => {
  // console.log(req.params.id)
  Comment.create({
    "postid": req.params.id,
    "user": req.session.passport.user,
    "body": req.body.body
  })
  .then(comment => {
    return Location.findByIdAndUpdate(req.params.id, {
      $inc: {'meta.numberOfComments': 1},
      $push: {comments: comment._id}
    }, {new: true})
    .then(data => res.send(data))
  }).catch(next)
}

const newLocation = (req, res, next) => {
  const {coordinates, name } = req.body
  // SWITCH from [lat, long] to [long, lat] for mongo
  coordinates.reverse();
  Location.create({
    "name": name,
    "user": req.session.passport.user,
    "location": {
      "type": "Point",
      "coordinates": coordinates
    },
  })
  .then(location => res.send(location))
  .catch(next)
}

module.exports = { 
  findNear, 
  newLocation, 
  featuredLocations, 
  addComment,
  viewLocation
}
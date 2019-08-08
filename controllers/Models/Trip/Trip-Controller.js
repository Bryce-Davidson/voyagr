const Trip = require('../../../models/Trip/TripSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const Day = require('../../../models/Day/DaySchema');
// SEARCH -----------------------------------------------------------------------

// - /featured
const featuredTrips = (req, res, next) => {
    const pagenation = parseInt(req.query.pagenation);
    Trip.find({}).sort({'meta.view_count': -1, 'meta.numberOfComments': -1, 'meta.likes': -1}).limit(pagenation)
    .then(data => res.send(data))
    .catch(next)
};

// GET --------------------------------------------------------------------------

// - /:id
const viewTrip = (req, res, next) => {
    Trip.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
    .populate('comments')
    .populate('days')
    .then(data => {
        res.send((data));
    })
    .catch(next)
}

// POST -------------------------------------------------------------------------

// - /:id/addcomment
const addComment = (req, res, next) => {
    Comment.create({
        "postid": req.params.id,
        "user": req.session.passport.user,
        "body": req.body.body
      })
      .then(comment => {
        return Trip.findByIdAndUpdate(req.params.id, {
          $inc: {'meta.numberOfComments': 1},
          $push: {comments: comment._id}
        }, {new: true})
        .then(tripWithComment => res.send(tripWithComment))
      }).catch(next)
};

// - /newtrip
const newTrip = (req, res, next) => {
    const {name, description, tags, private} = req.body;
    Trip.create({
        user: req.session.passport.user,
        name, description, private,
        settings: {private},
        meta: {tags}
    })
    .then(data => res.send(data))
    .catch(next)
};

// /:id/addday/:dayid
const addDayToTrip = (req, res, next) => {
    Trip.findByIdAndUpdate(req.params.id, {$push: {days: req.params.dayid}}, {new: true})
    .then(data => res.send(data))
    .catch(next)
}

module.exports = {
    newTrip,
    addDayToTrip,
    viewTrip,
    featuredTrips,
    addComment
};

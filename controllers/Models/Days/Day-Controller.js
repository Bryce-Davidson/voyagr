const Trip = require('../../../models/Trip/TripSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const Day = require('../../../models/Day/DaySchema');

// - /featured?pagenation=NUMBER
const featuredDays = (req, res, next) => {
    const pagenation = parseInt(req.query.pagenation);
    Day.find({}).sort({'meta.view_count': -1, 'meta.numberOfComments': -1, 'meta.likes': -1}).limit(pagenation)
    .then(data => res.send(data))
    .catch(next)
};

// GET --------------------------------------------------------------------------

// - /:id
const viewDay = (req, res, next) => {
    Day.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
    .populate('comments')
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
        return Day.findByIdAndUpdate(req.params.id, {
          $inc: {'meta.numberOfComments': 1},
          $push: {comments: comment._id}
        }, {new: true})
        .then(tripWithComment => res.send(tripWithComment))
      }).catch(next)
};

// - /newday
const newDay = (req, res, next) => {
    const { name, description } = req.body;
    Day.create({
        user: req.session.passport.user,
        name, description
    })
    .then(data => res.send(data))
    .catch(next)
};

// /:id/location/:locationid
const addLocationToDay = (req, res, next) => {
    Day.findByIdAndUpdate(req.params.id, {$push: {days: req.params.locationid}}, {new: true})
    .then(data => res.send(data))
    .catch(next)
}

module.exports = {
    newDay,
    viewDay,
    featuredDays,
    addLocationToDay,
    addComment
};
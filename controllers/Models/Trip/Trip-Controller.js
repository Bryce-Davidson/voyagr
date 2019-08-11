const Trip = require('../../../models/Trip/TripSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const Day = require('../../../models/Day/DaySchema');
const User = require('../../../models/User/UserSchema');
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
    .populate('comments', '-postid')
    .populate('days')
    .then(data => {
        res.send((data));
    })
    .catch(next)
}

// POST -------------------------------------------------------------------------

// - /newtrip
const newTrip = (req, res, next) => {
    const {name, description, tags, private} = req.body;
    let userid = req.session.passport.user;
    Trip.create({
        user: userid,
        name, description, private,
        settings: {private},
        meta: {tags}
    })
    .then(trip => {
        return User.findByIdAndUpdate(userid, {
            $push: {'posts.trips': trip._id}
        })
        .then(user => res.send(trip))
    })
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
    featuredTrips
};

const Trip = require('../../../models/Trip/TripSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const Day = require('../../../models/Day/DaySchema');
const User = require('../../../models/User/UserSchema');

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

const makeChildrenPrivate = (req, res, next) => {
    Trip.findById(req.params.id)
        .populate('days')
        .then(trip => {
            trip.days.forEach(day => {
                day.settings.private = true;
                day.save(function(err, day) {
                    if(err)
                        next(err)
                })
            });
            res.send(trip)
        })
        .catch(next)
}

const makeChildrenPublic = (req, res, next) => {
    Trip.findById(req.params.id)
        .populate('days')
        .then(trip => {
            trip.days.forEach(day => {
                day.settings.private = false;
                day.save(function(err) {
                    if(err) next(err)
                })
            });
            res.send(trip)
        })
        .catch(next)
}

module.exports = {
    newTrip,
    addDayToTrip,
    viewTrip,
    makeChildrenPrivate,
    makeChildrenPublic
};

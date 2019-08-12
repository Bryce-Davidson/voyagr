const Trip = require('../../../models/Trip/TripSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const User = require('../../../models/User/UserSchema');
const Day = require('../../../models/Day/DaySchema');

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

// - /newday
const newDay = (req, res, next) => {
    let userid = req.session.passport.user;
    const { name, description } = req.body;
    Day.create({
        user: userid,
        name, description
    })
    .then(day => {
        return User.findByIdAndUpdate(userid, {
            $push: {'posts.days': day._id}
        })
        .then(user => res.send(day))
    })
    .catch(next)
};

// /:id/addlocation/:locationid
const addLocationToDay = (req, res, next) => {
    Day.findByIdAndUpdate(req.params.id, {$push: {days: req.params.locationid}}, {new: true})
    .then(data => res.send(data))
    .catch(next)
}

module.exports = {
    newDay,
    viewDay,
    addLocationToDay
};
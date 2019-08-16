const Trip = require('../../../models/Trip/TripSchema');
const Comment = require('../../../models/Comment/CommentSchema');
const User = require('../../../models/User/UserSchema');
const Day = require('../../../models/Day/DaySchema');


// CREATE -------------------------------------------------------------------------

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


// READ --------------------------------------------------------------------------

const viewDay = (req, res, next) => {
    Day.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
    .populate('comments')
    .populate('locations')
    .populate('user', 'local.email')
    .then(data => {
        res.send((data));
    })
    .catch(next)
}


const addLocationToDay = (req, res, next) => {
    let dayid = req.params.id;

    Day.findById(dayid)
        .then(day => {
            if(day.isOwnedBy(req.user, res)) {

            }
        })
    Day.findByIdAndUpdate(req.params.id, {$push: {days: req.params.locationid}}, {new: true})
    .then(data => res.send(data))
    .catch(next)
}


// UPDATE --------------------------------------------------------------------------

const updateDay = (req, res, next) => {
    let dayid = req.params.id
    let update = req.body.update;

    Day.findById(dayid)
        .then(day => {
            if(day.isOwnedBy(req.user, res)) {
                return day.update(update, {new: true})
                    .then(newday => res.send(newday))
            }
        }).catch(next)
}

module.exports = {
    newDay,
    viewDay,
    addLocationToDay,
    updateDay
};
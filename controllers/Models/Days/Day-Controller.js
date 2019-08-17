const User = require('../../../models/User/UserSchema');
const Day = require('../../../models/Day/DaySchema');
const { userCanAlter } = require('../../../util/local-functions/schemaMethods');

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
    Day.findById(req.params.id)
        .then(day => {
            if (day.settings.private) {
                if (req.user == day.user) res.send(day)
                else res.status(401).send('Unauthorized')
            } else {
                return Day.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
                .populate('comments')
                .populate('locations')
                .populate('user', 'local.email')
                .then(data => {
                    res.send((data));
                })
            }
        })
        .catch(next)
}

// UPDATE ---------------------------------------------------------------

const addLocationToDay = (req, res, next) => {
    let dayid = req.params.id;
    let locid = req.params.locationid;
    Day.findById(dayid)
        .then(day => {
            if (userCanAlter(day, req.user, res)) {
                day.locations.push(locid)
                return day.save().then(uday => res.send(uday))
            }
        }).catch(next)
}

const updateDay = (req, res, next) => {
    let dayid = req.params.id
    let update = req.body.update;

    Day.findById(dayid)
        .then(day => {
            if (userCanAlter(day, req.user, res)) {
                return Day.findByIdAndUpdate(dayid, update)
                    .then(uday => res.send(uday))
            }
        }).catch(next)
}

module.exports = {
    newDay,
    viewDay,
    addLocationToDay,
    updateDay
};
const Trip          = require('../../../models/Trip/TripSchema');
const Day           = require('../../../models/Day/DaySchema');
const User          = require('../../../models/User/UserSchema');
const { isOwner, userCanAlter } = require('../../../util/local-functions/schemaMethods');

// CREATE -------------------------------------------------------------------------

const newTrip = (req, res, next) => {
    const {name, description, tags, private} = req.body;
    let userid = req.user;
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


// READ --------------------------------------------------------------------------

const viewTrip = (req, res, next) => {
    Trip.findById(req.params.id)
        .then(trip => {
            if (trip.settings.private) {
                if (req.user == trip.user) res.send(trip)
                else res.status(401).send("Unauthorized");
            } else {
                return Trip.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
                .populate('comments')
                .populate('days')
                .populate('user', 'local.username')
                .then(trip => { 
                    res.send((trip));
                })
                .catch(next)
            }
        })
}

// UPDATE -----------------------------------------------------------------------------

const addDayToTrip = (req, res, next) => {
    let tripid = req.params.id;
    let dayid  = req.params.dayid;
    Trip.findById(tripid)
        .then(trip => {
            if(userCanAlter(trip, req.user, res)) {
                trip.days.push(dayid)
                return trip.save().then(newTrip => res.send(newTrip))
            }
        }).catch(err)
}

const updateTrip = (req, res, next) => {
    let update = req.body.update;
    let tripid = req.params.id;
    Trip.findById(tripid)
        .then(trip => {
            if(userCanAlter(trip, req.user)) {
                return trip.findByIdAndUpdate(trip.id, update)
                    .then(utrip => res.send(utrip))
            }
        }).catch(next)
}

// CHILDREN FUNCTIONS --------------------------

const changeChildStatus = (req, res, next) => {
    let status = req.query.status;
    if (status != 'true' || 'false') {
        return res.send("Invaid status")
    }
    Trip.findById(req.params.id)
        .then(trip => {
            if(userCanAlter(trip, req.user, res)) {
                return trip.changeChildStatus(status)
                    .then(trip => {
                        res.send(trip)
                    })
            }
        }).catch(next)
}

module.exports = {
    newTrip,
    addDayToTrip,
    viewTrip,
    changeChildStatus,
    updateTrip
};
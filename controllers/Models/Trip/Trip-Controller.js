const Trip = require('../../../models/Trip/TripSchema');
const Day = require('../../../models/Day/DaySchema');
const User = require('../../../models/User/UserSchema');

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
    Trip.findByIdAndUpdate(req.params.id, {'$inc': {'meta.view_count': 1}}, {new: true})
    .populate('comments')
    .populate('days')
    .populate('user', 'local.email')
    .then(data => {
        res.send((data));
    })
    .catch(next)
}

// UPDATE -----------------------------------------------------------------------------

const addDayToTrip = (req, res, next) => {
    let tripid = req.params.id;
    let user = req.user;
    console.log(user)
    console.log(tripid)
    
    Trip.findById(tripid)
        .then(trip => {
        
        })
}

const updateTrip = (req, res, next) => {
    let update = req.body.update;
    let tripid = req.params.id;

    Trip.findById(tripid)
        .then(trip => {
            if(trip.isOwnedBy(req.user, res)) {
                return trip.update(update, {new: true})
                    .then(res.send(trip))
            }
        }).catch(next);
}

// CHILDREN FUNCTIONS --------------------------

const changeChildStatus = (req, res, next) => {
    let status = req.query.status;
    Trip.findById(req.params.id)
        .then(trip => {
            if(trip.isOwnedBy(req, res)){
                return trip.changeChildStatus(status)
                    .then(trip => res.send(trip))
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
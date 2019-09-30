const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User/UserSchema');
const Day = require('../../models/Day/DaySchema');
const Location = require('../../models/Location/LocationSchema');
const Trip = require('../../models/Trip/TripSchema');
const should = require('should');

const slugify = require('../../util/local-functions/slugify-string');
const test = require('../test-data');

var agent = request.agent(app);

//TODO: break out logging in into a seperate file and require the agent from there

before((done) => {
    let new_user = new User(test.user);
    new_user.save()
        .then(user => {
            done()
        })
})

describe('Agent Login ----------------------------------------------- \n', () => {
    it('Should log a user in', (done) => {
        agent
            .post('/login')
            .send({
                email: test.user.local.email,
                password: test.user.local.password
            })
            .expect(302)
            .end((err, res) => {
                done()
            })
    })
})

// TRIP ROUTES --------------------------------------------------------------

describe('/trips - Routes --------------------------------------------------- \n ', () => {
    let tripid;
    let dayid;
    // create child resources
    before(async (done) => {
        let new_day = new Day(test.save_day);
        new_day.save()
            .then(day => {
                dayid = String(day._id);
            })
            done()
    })

    it("Should create trip", (done) => {
        agent
            .post('/trips')
            .send(test.trip_1)
            .expect(201)
            .end((err, res) => {
                let trip = res.body;
                tripid = trip._id;
                trip.budget.currency.should.equal("USD")
                trip._id.should.equal(tripid)
                done()
            })
    })

    it('Should get all trips array', (done) => {
        agent
            .get('/trips')
            .expect(200)
            .end((err, res) => {
                should(res.body).is.Array;
                done()
            })
    })

    it('Should get trip by id', (done) => {
        agent
            .get(`/trips/${tripid}`)
            .expect(200)
            .end((err, res) => {
                res.body.budget.middleBound.should.equal(750);
                res.body._id.should.equal(tripid)
                done()
            })
    })

    it('Should add a day to the trip', (done) => {
        agent
            .post(`/trips/${tripid}/days`)
            .query({ dayid })
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.days.should.containEql(dayid);
                done()
            })
    })

    it('Should update trip name', (done) => {
        agent
            .put(`/trips/${tripid}`)
            .send({ name: 'Update test trip name' })
            .expect(200)
            .end((err, res) => {
                trip = res.body;
                trip.name.should.equal("Update test trip name")
                trip.slug.should.equal("update-test-trip-name")
                done()
            })
    })

    it('Should like a trip by id', (done) => {
        agent
            .put(`/trips/${tripid}/likes`)
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.meta.likes.should.equal(0)
                done()
            })
    })

    it('Should delete trip by id', (done) => {
        agent
            .delete(`/trips/${tripid}`)
            .expect(200)
            .end((err, res) => {
                res.body.msg.should.equal("Trip deleted succesfully")
                done()
            })
    })

    // clean days
    after((done) => {
        Day.findByIdAndDelete(dayid)
            .then(d => {
                done()
            })
    })
})

// DAY ROUTES ---------------------------------------------------------------

describe('/days - Routes ---------------------------------------------------- \n', () => {
    let dayid;
    let locationid;


    before((done) => {
        let location = new Location(test.save_location).save()
            .then(loc => {
                locationid = String(loc._id);
                done()
            })
    })

    it("Should create a day", (done) => {
        agent
            .post('/days')
            .send(test.day_1)
            .expect(201)
            .end((err, res) => {
                dayid = res.body._id;
                res.body.budget.currency.should.equal('CAD')
                should.not.exist(err);
                done()
            })
    })

    it('Should get all days array', (done) => {
        agent
            .get('/days')
            .expect(200)
            .end((err, res) => {
                should(res.body).is.Array;
                done()
            })
    })

    it('Should get day by id', (done) => {
        agent
            .get(`/days/${dayid}`)
            .expect(200)
            .end((err, res) => {
                res.body.budget.middleBound.should.equal(50);
                res.body._id.should.equal(dayid)
                done()
            })
    })

    it('Should add a location to a day', (done) => {
        agent
            .post(`/days/${dayid}/locations`)
            .query({locationid:locationid})
            .expect(200)
            .end((err, res) => {
                let day = res.body;
                day.locations.should.containEql(locationid);
                done()
            })
    })

    it('Should update day name', (done) => {
        agent
            .put(`/days/${dayid}`)
            .send({ name: 'Update test day name' })
            .expect(200)
            .end((err, res) => {
                day = res.body;
                day.name.should.equal("Update test day name")
                day.slug.should.equal("update-test-day-name")
                done()
            })
    })

    it('Should delete day by id', (done) => {
        agent
            .delete(`/days/${dayid}`)
            .expect(200)
            .end((err, res) => {
                res.body.msg.should.equal("Day deleted succesfully")
                done()
            })
    })

    after((done) => {
        Location.findByIdAndDelete(locationid)
            .then(d => {
                done()
            })
    })

})

after("Log user out and delete", (done) => {

    User.findOneAndDelete({
        email: test.user.email,
    })
        .then(duser => {
            console.log("Deleted User")
            done()
        })
})

module.exports = agent;
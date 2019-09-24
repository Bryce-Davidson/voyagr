const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User/UserSchema');
const Day = require('../../models/Day/DaySchema');
const Trip = require('../../models/Trip/TripSchema');
const should = require('should');

const slugify = require('../../util/local-functions/slugify-string');
const test = require('../test-data');

var agent = request.agent(app);

before((done) => {
    let new_user = new User(test.user);
    new_user.save()
        .then(user => {
            done()
        })
})

describe('Agent Login', () => {
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

// TRIP ROUTES ---------------------------------------------------------------

describe('/trips - Routes ---------------------------------------------------- \n', () => {
    let tripid;

    it("Should create trip", (done) => {
        agent
            .post('/trips')
            .send(test.trip_1)
            .expect(201)
            .end((err, res) => {
                tripid = res.body._id;
                res.body.budget.currency.should.equal("USD")
                done()
            })
    })

    it('Should get all trips array', (done) => {
        // NOTE: test is failing due to API integration failure getTrips in ../../trip-controller.js
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

    it('Should update trip name', (done) => {
        agent
            .put(`/trips/${tripid}`)
            .send({ name: 'Update test trip name' })
            .expect(200)
            .end((err, res) => {
                trip = res.body;
                trip.name.should.equal("Update test trip name")
                trip.slug.should.equal(slugify("Update test trip name"))
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
})

// DAY ROUTES ---------------------------------------------------------------

describe('/days - Routes ---------------------------------------------------- \n', () => {
    let dayid;

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
        // NOTE: test is failing due to API integration failure getdays in ../../trip-controller.js
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

    it('Should update day name', (done) => {
        agent
            .put(`/days/${dayid}`)
            .send({ name: 'Update test day name' })
            .expect(200)
            .end((err, res) => {
                day = res.body;
                day.name.should.equal("Update test day name")
                day.slug.should.equal(slugify("Update test day name"))
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
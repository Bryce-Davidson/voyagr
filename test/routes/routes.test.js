const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User/UserSchema');
const Day = require('../../models/Day/DaySchema');
const Location = require('../../models/Location/LocationSchema');
const Trip = require('../../models/Trip/TripSchema');
const should = require('should');

const test = require('../test-data');

var agent = request.agent(app);
var agent_2 = request.agent(app);

before((done) => {
    let new_user = new User(test.user).save().then(user => {
        let new_user_2 = new User(test.user_2).save().then(user => {
            done()
        })
    });
})

// GLOBALS ------------------------------------------------------------------------

let TEST_TRIP_ID;
let TEST_DAY_ID;
let TEST_LOCATION_ID;

let TEST_TRIP_COMMENT_1;
let TEST_TRIP_COMMENT_2;

let TEST_DAY_COMMENT_1;
let TEST_DAY_COMMENT_2;

let TEST_LOCATION_COMMENT_1;
let TEST_LOCATION_COMMENT_2;



describe('Agent Login ----------------------------------------------- \n', () => {
    it('Should log user 1 in', (done) => {
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

    it('Should log user 2 in', (done) => {
        agent_2
            .post('/login')
            .send({
                email: test.user_2.local.email,
                password: test.user_2.local.password
            })
            .expect(302)
            .end((err, res) => {
                done()
            })
    })
})

// TRIP OWNER AGENT ROUTES --------------------------------------------------------------

describe('/trips - OWNER - Routes --------------------------------------------------- \n ', () => {

    before(async (done) => {
        let new_day = new Day(test.save_day);
        new_day.save()
            .then(day => {
                TEST_DAY_ID = String(day._id);
            })
            done()
    })

    it('Should get all trips array', (done) => {
        agent
            .get('/trips')
            .expect(200)
            .end((err, res) => {
                should(res.body).is.Array;
                res.body.length.should.be.lessThan(15)
                done()
            })
    })

    it("Should create a trip", (done) => {
        agent
            .post('/trips')
            .send(test.trip_1)
            .expect(201)
            .end((err, res) => {
                TEST_TRIP_ID = res.body._id;
                let trip = res.body;
                trip.budget.currency.should.equal('USD')
                trip.should.have.property('user')
                done()
            })
    })

    it('Should get trip by id', (done) => {
        agent
            .get(`/trips/${TEST_TRIP_ID}`)
            .expect(200)
            .end((err, res) => {
                res.body.budget.middleBound.should.equal(750);
                res.body._id.should.equal(TEST_TRIP_ID)
                done()
            })
    })

    it('Should add a day to the trip', (done) => {
        agent
            .put(`/trips/${TEST_TRIP_ID}/days`)
            .query({ dayid: TEST_DAY_ID })
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.days.should.containEql(TEST_DAY_ID);
                done()
            })
    })

    it('Should update trip name', (done) => {
        agent
            .put(`/trips/${TEST_TRIP_ID}`)
            .send({ name: 'Update test trip name' })
            .expect(200)
            .end((err, res) => {
                trip = res.body;
                trip.name.should.equal("Update test trip name")
                trip.slug.should.equal("update-test-trip-name")
                done()
            })
    })

    it('Should -NOT- LIKE a trip by id', (done) => {
        agent
            .put(`/trips/${TEST_TRIP_ID}/likes`)
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.meta.likes.should.equal(0)
                done()
            })
    })

    it('Should -NOT- VIEW a trip by id', (done) => {
        agent
            .get(`/trips/${TEST_TRIP_ID}`)
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.meta.viewCount.should.equal(0)
                done()
            })
    })

    it('Should add a comment to a trip by id', (done) => {
        agent
            .post(`/trips/${TEST_TRIP_ID}/comments`)
            .send({
                commentBody: "this is a test comment and should be deleted",
                title: "test comment"
            })
            .end((err, res) => {
                let trip = res.body;
                TEST_TRIP_COMMENT_1 = trip.comments[0]
                trip.meta.numberOfComments.should.equal(1);
                trip.comments.length.should.equal(1);
                done()
            })
    })

    it('Should get a trips comments', (done) => {
        agent
            .get(`/trips/${TEST_TRIP_ID}/comments`)
            .expect(201)
            .end((err, res) => {
                let comments = res.body;
                comments.length.should.equal(1)
                done()
            })
    })

    it('Should delete a comment by id', (done) => {
        agent
            .delete(`/trips/${TEST_TRIP_ID}/comments`)
            .query({commentid: TEST_TRIP_COMMENT_1})
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.comments.length.should.equal(0)
                done()
            })
    })

    it('Should delete trip by id', (done) => {
        agent
            .delete(`/trips/${TEST_TRIP_ID}`)
            .expect(200)
            .end((err, res) => {
                res.body.msg.should.equal("Trip deleted succesfully")
                done()
            })
    })

    after((done) => {
        Day.findByIdAndDelete(TEST_DAY_ID)
            .then(d => {
                done()
            })
    })
})

// TRIP VIEWER AGENT ROUTES --------------------------------------------------------------

describe('/trips - VIEWER - Routes --------------------------------------------------- \n ', () => {

    before(async (done) => {
        let new_day = new Day(test.save_day);
        new_day.save()
            .then(day => {
                TEST_DAY_ID = String(day._id);
            })
            done()
    })

    it('Should get all trips array', (done) => {
        agent_2
            .get('/trips')
            .expect(200)
            .end((err, res) => {
                should(res.body).is.Array;
                done()
            })
    })

    it("Should create a trip -AGENT_1-", (done) => {
        agent
            .post('/trips')
            .send(test.trip_1)
            .expect(201)
            .end((err, res) => {
                TEST_TRIP_ID = res.body._id;
                res.body.budget.currency.should.equal('USD')
                done()
            })
    })

    it('Should -NOT- add a day to the trip', (done) => {
        agent_2
            .put(`/trips/${TEST_TRIP_ID}/days`)       
            .query({ dayid: TEST_DAY_ID })
            .expect(401, done)
    })

    it('Should -NOT- update trip name', (done) => {
        agent_2
            .put(`/trips/${TEST_TRIP_ID}`)
            .send({ name: 'Update test trip name' })
            .expect(401, done)
    })

    it('Should LIKE a trip by id', (done) => {
        agent_2
            .put(`/trips/${TEST_TRIP_ID}/likes`)
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.meta.likes.should.equal(1)
                done()
            })
    })

    it('Should VIEW a trip by id', (done) => {
        agent_2
            .get(`/trips/${TEST_TRIP_ID}`)
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.meta.viewCount.should.equal(1)
                done()
            })
    })

    it('Should add a comment to a trip by id', (done) => {
        agent_2
            .post(`/trips/${TEST_TRIP_ID}/comments`)
            .send({
                commentBody: "this is a test comment and should be deleted",
                title: "test comment"
            })
            .end((err, res) => {
                let trip = res.body;
                TEST_TRIP_COMMENT_2 = trip.comments[0]
                trip.meta.numberOfComments.should.equal(1);
                trip.comments.length.should.equal(1);
                done()
            })
    })

    it('Should -NOT- delete trip by id', (done) => {
        agent_2
            .delete(`/trips/${TEST_TRIP_ID}`)
            .expect(401, done)
    })

    it('Should delete trip by id', (done) => {
        agent
            .delete(`/trips/${TEST_TRIP_ID}`)
            .expect(200)
            .end((err, res) => {
                res.body.msg.should.equal("Trip deleted succesfully")
                done()
            })
    })

    after((done) => {
        Day.findByIdAndDelete(TEST_DAY_ID)
            .then(d => {
                done()
            })
    })
})



// DAY OWNER AGENT ROUTES ---------------------------------------------------------------

describe('/days - OWNER - Routes ---------------------------------------------------- \n', () => {
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
                TEST_DAY_ID = res.body._id;
                res.body.budget.currency.should.equal('CAD')
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
            .get(`/days/${TEST_DAY_ID}`)
            .expect(200)
            .end((err, res) => {
                let day = res.body;
                day.budget.middleBound.should.equal(50);
                day._id.should.equal(String(TEST_DAY_ID))
                done()
            })
    })

    it('Should -NOT- LIKE a day by id', (done) => {
        agent
            .put(`/days/${TEST_DAY_ID}/likes`)
            .expect(200)
            .end((err, res) => {
                let day = res.body;
                day.meta.likes.should.equal(0)
                done()
            })
    })

    it('Should -NOT- VIEW a day by id', (done) => {
        agent
            .get(`/days/${TEST_DAY_ID}`)
            .expect(200)
            .end((err, res) => {
                let day = res.body;
                day.meta.viewCount.should.equal(0)
                done()
            })
    })

    it('Should add a comment to a day by id', (done) => {
        agent
            .post(`/days/${TEST_DAY_ID}/comments`)
            .send({
                commentBody: "this is a test comment and should be deleted",
                title: "test comment"
            })
            .end((err, res) => {
                let day = res.body;
                TEST_DAY_COMMENT_1 = day.comments[0]
                day.meta.numberOfComments.should.equal(1);
                day.comments.length.should.equal(1);
                done()
            })
    })

    it('Should get a days comments', (done) => {
        agent
            .get(`/days/${TEST_DAY_ID}/comments`)
            .expect(201)
            .end((err, res) => {
                let comments = res.body;
                comments.length.should.equal(1)
                done()
            })
    })

    it('Should delete a comment by id', (done) => {
        agent
            .delete(`/days/${TEST_DAY_ID}/comments`)
            .query({commentid: TEST_DAY_COMMENT_1})
            .expect(200)
            .end((err, res) => {
                let day = res.body;
                day.comments.length.should.equal(0)
                done()
            })
    })

    it('Should add a location to a day', (done) => {
        agent
            .put(`/days/${TEST_DAY_ID}/locations`)
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
            .put(`/days/${TEST_DAY_ID}`)
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
            .delete(`/days/${TEST_DAY_ID}`)
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

// DAY VEIWER AGENT ROUTES ---------------------------------------------------------------


describe('/days - VIEWER - Routes --------------------------------------------------- \n ', () => {

    before((done) => {
        let location = new Location(test.save_location).save()
            .then(loc => {
                TEST_LOCATION_ID = String(loc._id);
                done()
            })
    })

    it("Should create a day -AGENT_1-", (done) => {
        agent
            .post('/days')
            .send(test.day_1)
            .expect(201)
            .end((err, res) => {
                TEST_DAY_ID = res.body._id;
                res.body.budget.currency.should.equal('CAD')
                done()
            })
    })

    it('Should -NOT- add a location to the day', (done) => {
        agent_2
            .put(`/days/${TEST_DAY_ID}/locations`)            
            .query({ locationid: TEST_LOCATION_ID })
            .expect(401, done)
    })

    it('Should -NOT- update day name', (done) => {
        agent_2
            .put(`/days/${TEST_DAY_ID}`)
            .send({ name: 'Update test trip name' })
            .expect(401, done)
    })

    it('Should LIKE a day by id', (done) => {
        agent_2
            .put(`/days/${TEST_DAY_ID}/likes`)
            .expect(200)
            .end((err, res) => {
                let trip = res.body;
                trip.meta.likes.should.equal(1)
                done()
            })
    })

    it('Should VIEW a day by id', (done) => {
        agent_2
            .get(`/days/${TEST_DAY_ID}`)
            .expect(200)
            .end((err, res) => {
                let day = res.body;
                day.meta.viewCount.should.equal(1)
                done()
            })
    })

    it('Should -NOT- delete day by id', (done) => {
        agent_2
            .delete(`/days/${TEST_DAY_ID}`)
            .expect(401, done)
    })

    it('Should -NOT- delete day by id', (done) => {
        agent_2
            .delete(`/days/${TEST_DAY_ID}`)
            .expect(401, done)
    })

    it('Should delete day by id', (done) => {
        agent
            .delete(`/days/${TEST_DAY_ID}`)
            .expect(200)
            .end((err, res) => {
                res.body.msg.should.equal("Day deleted succesfully")
                done()
            })
    })

    after((done) => {
        Location.findByIdAndDelete(TEST_DAY_ID)
            .then(d => {
                done()
            })
    })
})


//  LOCATION OWNER TESTING ------------------------------------------------------

describe('/locations - OWNER - Routes --------------------------------------------------- \n ', () => {
    it("Should create a location", (done) => {
        agent
            .post('/locations')
            .send(test.location_1)
            .expect(201)
            .end((err, res) => {
                TEST_LOCATION_ID = res.body._id;
                done()
            })
    })

    it('Should get all locations array', (done) => {
        agent
            .get('/locations')
            .expect(200)
            .end((err, res) => {
                should(res.body).is.Array;
                res.body.length.should.be.lessThanOrEqual(15)
                done()
            })
    })

    it('Should get location by id', (done) => {
        agent
            .get(`/locations/${TEST_LOCATION_ID}`)
            .expect(200)
            .end((err, res) => {
                res.body._id.should.equal(TEST_LOCATION_ID)
                done()
            })
    })

    it('Should -NOT- LIKE a location by id', (done) => {
        agent
            .put(`/locations/${TEST_LOCATION_ID}/likes`)
            .expect(200)
            .end((err, res) => {
                let location = res.body;
                location.meta.likes.should.equal(0)
                done()
            })
    })

    it('Should -NOT- VIEW a location by id', (done) => {
        agent
            .get(`/locations/${TEST_LOCATION_ID}`)
            .expect(200)
            .end((err, res) => {
                let location = res.body;
                location.meta.viewCount.should.equal(0)
                done()
            })
    })

    it('Should add a comment to a location by id', (done) => {
        agent
            .post(`/locations/${TEST_LOCATION_ID}/comments`)
            .send({
                commentBody: "this is a test comment and should be deleted",
                title: "test comment"
            })
            .end((err, res) => {
                let location = res.body;
                TEST_LOCATION_COMMENT_1 = location.comments[0]
                location.meta.numberOfComments.should.equal(1);
                location.comments.length.should.equal(1);
                done()
            })
    })

    it('Should get a locations comments', (done) => {
        agent
            .get(`/locations/${TEST_LOCATION_ID}/comments`)
            .expect(201)
            .end((err, res) => {
                let comments = res.body;
                comments.length.should.equal(1)
                done()
            })
    })

    it('Should delete a comment by id', (done) => {
        agent
            .delete(`/locations/${TEST_LOCATION_ID}/comments`)
            .query({commentid: TEST_LOCATION_COMMENT_1})
            .expect(200)
            .end((err, res) => {
                let location = res.body;
                location.comments.length.should.equal(0)
                done()
            })
    })

    it('Should update location name', (done) => {
        agent
            .put(`/locations/${TEST_LOCATION_ID}`)
            .send({ name: 'Update test location name' })
            .expect(200)
            .end((err, res) => {
                location = res.body;
                location.name.should.equal("Update test location name")
                location.slug.should.equal("update-test-location-name")
                done()
            })
    })

    it('Should delete location by id', (done) => {
        agent
            .delete(`/locations/${TEST_LOCATION_ID}`)
            .expect(200)
            .end((err, res) => {
                res.body.msg.should.equal("Location deleted succesfully")
                done()
            })
    })
})

//  LOCATION VIEW TESTING -------------------------------------------------------------

describe('/locations - VIEWER - Routes --------------------------------------------------- \n ', () => {
    it("Should create a location -Agent1-", (done) => {
        agent
            .post('/locations')
            .send(test.location_1)
            .expect(201)
            .end((err, res) => {
                TEST_LOCATION_ID = res.body._id;
                done()
            })
    })

    it('Should get all locations array', (done) => {
        agent_2
            .get('/locations')
            .expect(200)
            .end((err, res) => {
                should(res.body).is.Array;
                res.body.length.should.be.lessThanOrEqual(15)
                done()
            })
    })

    it('Should LIKE a location by id', (done) => {
        agent_2
            .put(`/locations/${TEST_LOCATION_ID}/likes`)
            .expect(200)
            .end((err, res) => {
                let location = res.body;
                location.meta.likes.should.equal(1)
                done()
            })
    })

    it('Should VIEW a location by id', (done) => {
        agent_2
            .get(`/locations/${TEST_LOCATION_ID}`)
            .expect(200)
            .end((err, res)=> {
                let location = res.body;
                location.meta.viewCount.should.equal(1)
                done()
            })

    })

    it('Should -NOT- update location name', (done) => {
        agent_2
            .put(`/locations/${TEST_LOCATION_ID}`)
            .send({ name: 'Update test location name' })
            .expect(401, done)
    })

    it('Should delete location by id', (done) => {
        agent
            .delete(`/locations/${TEST_LOCATION_ID}`)
            .expect(200)
            .end((err, res) => {
                res.body.msg.should.equal("Location deleted succesfully")
                done()
            })
    })
})


after("Log user out and delete", (done) => {

    User.findOneAndDelete({
        email: test.user.email,
    })
    User.findOneAndDelete({
        email: test.user_2.email,
    })
    .then(duser => {
        console.log("Deleted User")
        done()
        })
})

module.exports = agent;
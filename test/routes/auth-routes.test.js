const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User/UserSchema');
const should = require('should');

const slugify = require('../../util/local-functions/slugify-string');
const test = require('../../test/test-data');

var agent = request.agent(app); 

PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});

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

describe('/trips - Routes', () => {
    let tripid;

    it("Should create trip",(done) => {
        agent
            .post('/trips')
            .send(test.trip_1)
            .expect(201)
            .end((err, res) => {
                tripid = res.body._id;
                should.not.exist(err);
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
            .send({name: 'Update test trip name'})
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

after("Log user out and delete", (done) => {
    
    User.findOneAndDelete({
        email: test.user.email,
    })
    .then(duser => {
        console.log("Deleted User")
        done()
    })
})
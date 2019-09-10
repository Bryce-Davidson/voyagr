const request = require('supertest');
const app = require('../../app');
const agent1 = request.agent();
const User = require('../../models/User/UserSchema');
const Trip = require('../../models/Trip/TripSchema');
const should = require('should');

const base = "http://localhost:4000";

const test_trip = {
	"name": "Test Trip #1",
	"description": "This is a test trip and should be deleted",
	"tags": ["test", "one", "two", "three"],
	"upperBound": 1000,
	"lowerBound": 500,
	"public": true
}

const test_user = {
    local: {
        email: 'testuser@mail.com',
        password: 'testPassword',
        username: 'tester'
    }
}

var agent = request.agent(app);

// post trip
// update trip
// delete trip
// 

before((done) => {
    let new_user = new User(test_user);
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
                email: test_user.local.email,
                password: test_user.local.password
            })
            .expect(302)
            .end((err, res) => {
                done()
            })
    })
})

describe('/trips - Routes', () => {
    let tripid;
    before("Create Trip",(done) => {
        agent
            .post('/trips')
            .send(test_trip)
            .expect(201)
            .end((err, res) => {
                tripid = res.body._id;
                should.not.exist(err);
                done()
            })
    })

    it('Should get trips array', (done) => {
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
                should.equal(tripid, res.body._id);
                done()
            })
    })

    it('Should update a trip', (done) => {
        agent
            .put(`/trips/${tripid}`)
            .send({name: 'Update test trip name'})
            .expect(200)
            .end((err, res) => {
                trip = res.body;
                trip.name.should.equal("Update test trip name")
                done()
            })
    })

    after("Delete Trip", (done) => {
        Trip.findByIdAndDelete(tripid)
            .then(dtrip => {
                console.log("Deleted Trip")
                done()
            })
    })
})

after((done) => {
    User.findOneAndDelete(test_user)
        .then(duser => {
            console.log("Deleted User")
            done()
        })
})
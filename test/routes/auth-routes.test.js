const request = require('supertest');
const app = require('../../app');
const agent1 = request.agent();
const User = require('../../models/User/UserSchema');
const Trip = require('../../models/Trip/TripSchema');
const should = require('should');

const base = "http://localhost:4000";

const test_trip = {
	"name": "User created Trip #1",
	"description": "This is a test trip and should be deleted",
	"tags": ["test", "one", "two", "three"],
	"upperBound": 1000,
	"lowerBound": 400,
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

before((done) => {
    let new_user = new User(test_user);
    new_user.save()
    .then(user => {
        done()
    })
})

describe('User Login', () => {
    it('Should log a user in', (done) => {
        agent
            .post('/login')
            .send({
                email: test_user.local.email,
                password: test_user.local.password
            })
            .expect(200)
            .end((err, res) => {
                done()
            })
    })
})

describe('/trips', () => {
    let tripid;
    before((done) => {
        agent
            .post('/trips')
            .send(test_trip)
            .end((err, res) => {
                tripid = res.body._id;
                should.not.exist(err);
                done()
            })
    })

    it('Should get trips', (done) => {
        agent
            .get('/trips')
            .expect(200, done)
    })

    it('Should get trip by id', (done) => {
        agent
            .get(`/trips/${tripid}`)
            .expect(200)
            .end((err, res) => {
                should.equal(tripid, res.body._id)
                done()
            })
    })

    after((done) => {
        Trip.findByIdAndDelete(tripid)
            .then(dtrip => {
                done()
            })
    })
})

after((done) => {
    User.findOneAndDelete(test_user)
        .then(duser => {
            console.log(duser)
            done()
        })
})
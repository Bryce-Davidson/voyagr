const request = require('supertest');
const app     = require('../../app');
const agent1  = request.agent();
const User    = require('../../models/User/UserSchema');

const user = {
    email: 'testuser@mail.com',
    password: 'testPassword',
    username: 'tester'
}

// create new user before each run through

before((done) => {
    var new_user = new User(user);
    new_user
        .save()
        .then(user => {
            // log the agent in here
            done()
        })
        .catch(console.log)
})

describe('User Auth Routes - W/Agent', () => {
    it('Should access user page.', (done) => {

    })
})

after((done) => {
    
})
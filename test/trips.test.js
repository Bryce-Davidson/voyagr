const app        = require('../app');
const supertest  = require('supertest');
const agent1     = supertest.agent(app);
const assert     = require('assert');

const user = {
    email: 'life@gmail.com',
    password: 'admin',
    username: 'okthen'
}

describe('Authentication', () => {
    it("Respond with 200", (done) => {
        agent1
            .get('/trips')
    })
})

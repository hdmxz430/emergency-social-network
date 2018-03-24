require('../../models/db');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');

let expect = require('expect.js');
let agent = require('superagent');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

suite('User Profile Tests', function () {
    let newUser;

    setup(done => {
        // for every test, remove all of the users and register new users
        User.remove().then(() => {
            agent.post(HOST + '/users/auth')
                .send(dbUsers[0])
                .end((err, res) => {
                    newUser = res.body;
                    done();
                });
        });
    });

    test('Testing update status successfully', function (done) {
        let user_status = {
            token: newUser.token,
            user_status: "1"
        };

        agent.put(HOST + '/users/status')
            .send(user_status)
            .end((err, res) => {
                expect(res.body.message).to.be('Update Successfully!');
                done();
            });
    });

    test('Testing update status which is invalid', function (done) {
        let user_status = {
            token: newUser.token,
            user_status: 60
        };

        agent.put(HOST + '/users/status')
            .send(user_status)
            .end((err, res) => {
                expect(res.status).to.be(400);
                expect(res.body.user_status).to.be('Emergency Status should be: 0-Undefined 1-OK 2-Help 3-Emergency');
                agent.get(HOST + '/users')
                    .query({token: newUser.token})
                    .end((err, res) => {
                        expect(res.body.users[0].user_status).to.be.eql(0);
                        done();
                    });
            });
    });

    test('Testing update status which status is undefined', function (done) {
        let user_status = {
            token: newUser.token,
            user_status: 0
        };

        agent.put(HOST + '/users/status')
            .send(user_status)
            .end((err, res) => {
                expect(res.status).to.be(400);
                expect(res.body.user_status).to.be('You can not set the status to undefined');
                agent.get(HOST + '/users')
                    .query({token: newUser.token})
                    .end((err, res) => {
                        expect(res.body.users[0].user_status).to.be.eql(0);
                        done();
                    });
            });
    });

    test('Testing update status that body has no token', done => {
        let status = {
            user_status: "0"
        };

        agent.put(HOST + '/users/status')
            .send(status)
            .end((err, res) => {
                expect(res.body.message).to.be('You do not have permission');
                done();
            });
    });

    test('Testing update warn status successfully', function (done) {
        let user_warn = {
            token: newUser.token,
            username: 'zeqiang'
        };

        agent.put(HOST + '/users/updateWarn')
            .send(user_warn)
            .end((err, res) => {
                expect(res.status).to.be(200);
                expect(res.body.message).to.be('Update Successfully');
                done();
            });
    });

});
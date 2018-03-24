/* Also test for 'index_controller'*/
let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const User = require('../../models/user');
const {dbUsers, newUsers} = require('../data/user_data');
const {CUser} = require('../../models/const');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

suite('Join Community API Test', function () {
    let currentUser1;

    setup(done => {
        // for every test, remove all of DB's current users and add Default Users for Testing
        User.remove().then(() => {
            let user = _.pick(dbUsers[0], ['username', 'password']);
            User.Create(user)
                .then(user => user.generateToken())
                .then(user => user.updateOnlineStatus(CUser.STATUS_ONLINE))
                .then(user => {
                    currentUser1 = {token: user.token, username: _.pick(user, ['username'])};
                    done();
                })
                .catch(err => {
                    done(err);
                });
        });
    });

    test('Current User Login', function (done) {
        let user = {username: dbUsers[0].username, password: dbUsers[0].password};
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                // Assertion Statements here
                expect(res.status).to.be(200);
                expect(res.body.user.username).to.be(dbUsers[0].username);
                console.log(res.body.token);
                done();
            });

    });

    test('New User Login', function (done) {
        let user = newUsers[4];
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                expect(res.status).to.be(201);
                expect(res.body.message).to.match(/Do not have user/);
                agent.post(HOST + '/users/auth')
                    .send(user)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        expect(res.body.user.username).to.be(user.username);
                        done();
                    });
            });

    });

    test('Get User Directory', function (done) {
        /*Add another User to Directory, Now Directory contain two users*/
        let user = _.pick(dbUsers[1], ['username', 'password']);
        User.Create(user)
            .then(user => user.generateToken())
            .then(user => user.updateOnlineStatus(CUser.STATUS_ONLINE))
            .then(user => {

                currentUser1 = {token: user.token, username: _.pick(user, ['username'])};
                agent.get(HOST + '/users')
                    .query({token: user.token})
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        expect(res.body.users[0].username).to.be(dbUsers[1].username);
                        expect(res.body.users[1].username).to.be(dbUsers[0].username); //in alphabetical order
                        done();
                    });
            })
            .catch(err => {
                expect().fail(err);
                console.log(err);
                done();
            });
    });

    test('User Logout', function (done) {
        /*Add another User to Directory, Now Directory contain two users*/
        let user = {username: dbUsers[0].username, password: dbUsers[0].password};
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                // Assertion Statements here
                expect(res.status).to.be(200);
                expect(res.body.user.username).to.be(dbUsers[0].username);
                user.token = res.body.token;
                console.log(res.body.token);
                agent.delete(HOST + '/users/auth')
                    .send({token: res.body.token})
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        agent.delete(HOST + '/users/auth')
                            .send({token: user.token})
                            .end(function (err, res) {
                                expect(res.status).to.be(401);
                                done();
                            });
                    });
            });
    });
});
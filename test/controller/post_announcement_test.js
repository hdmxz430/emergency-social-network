let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const Announcement = require('../../models/announcement');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');
const dbAnnouncements = require('../data/announcement_data').dbAnnouncements;
const {CUser} = require('../../models/const');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;



suite('Post Announcement API Test', function () {

    setup(done => {
        // for every test, remove all of DB's current users and add Default Users for Testing
        User.remove().then(() => {
            User.Create(dbUsers[0])
                .then(user => user.generateToken())
                .then(user => user.updatePrivilege(CUser.PRIVILEGE_COORDINATOR))
                .then(() => User.Create(dbUsers[1]))
                .then(user => user.generateToken())
                .then(() => Announcement.clear())
                .then(() => done())
                .catch(err => {
                    expect().fail(err);
                    console.log(err);
                    done();
                });
        });
    });

    test('Get Empty Announcement', function (done) {
        let user = {username: dbUsers[0].username, password: dbUsers[0].password};
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                // Assertion Statements here
                expect(res.status).to.be(200);
                expect(res.body.user.username).to.be(dbUsers[0].username);
                console.log('User Loged In');
                user.token = res.body.token;
                agent.get(HOST + '/announcement')
                    .query({token: user.token, limit: 1})
                    .end(function (err, res) {
                        expect(res.status).to.be(204);
                        done();
                    });
            });

    });

    test('Get Announcement', function (done) {
        Announcement.addNewAnnouncement(dbAnnouncements[0])
            .then(() => {
                let user = {username: dbUsers[0].username, password: dbUsers[0].password, limit: 1};
                agent.get(HOST + '/users/auth')
                    .query(user)
                    .end(function (err, res) {
                        // Assertion Statements here
                        expect(res.status).to.be(200);
                        expect(res.body.user.username).to.be(dbUsers[0].username);
                        console.log('User Loged In');
                        user.token = res.body.token;
                        agent.get(HOST + '/announcement')
                            .query({token: user.token, limit: 0})
                            .end(function (err, res) {
                                expect(res.status).to.be(200);
                                console.log(res.body);
                                expect(res.body.announcements[0].sender).to.be(dbAnnouncements[0].sender);
                                expect(res.body.announcements[0].content).to.be(dbAnnouncements[0].content);
                                done();
                            });
                    });
            });
    });


    test('Post Announcement', function (done) {
        let user = {username: dbUsers[0].username, password: dbUsers[0].password};
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                // Assertion Statements here
                expect(res.status).to.be(200);
                expect(res.body.user.username).to.be(dbUsers[0].username);
                console.log('User Loged In');
                user.token = res.body.token;
                agent.post(HOST + '/announcement')
                    .send({
                        token: user.token,
                        sender: dbAnnouncements[0].sender,
                        content: dbAnnouncements[0].content
                    })
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        expect(res.body.announcement.sender).to.be(dbAnnouncements[0].sender);
                        expect(res.body.announcement.content).to.be(dbAnnouncements[0].content);
                        done();
                    });
            });
    });

    test('Post Announcement which is invalid', function (done) {
        let user = dbUsers[1];
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                // Assertion Statements here
                expect(res.status).to.be(200);
                expect(res.body.user.username).to.be(dbUsers[1].username);
                console.log('User Loged In');
                user.token = res.body.token;
                agent.post(HOST + '/announcement')
                    .send({
                        token: user.token,
                        sender: dbAnnouncements[0].sender,
                        content: dbAnnouncements[0].content
                    })
                    .end(function (err, res) {
                        expect(res.status).to.be(401);
                        // expect(res.body.announcement.sender).to.be(dbAnnouncements[0].sender);
                        // expect(res.body.announcement.content).to.be(dbAnnouncements[0].content);
                        done();
                    });
            });
    });
});
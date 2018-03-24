let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const Announcement = require('../../models/announcement');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');
const {CUser} = require('../../models/const');
let PORT = 3001;
let HOST = 'http://localhost:' + PORT;
let search = '/search_info/search_by_announcement';

// // Initiate Server
// let app = require('../../app').app;
//
// app.set('testing', true);
//
// let serverInitialized = function () {
//     console.log('Express server listening on port ' + PORT);
// };
//
// let server = app.listen(PORT, serverInitialized);

suite('Search Message Tests', () => {

    setup(done => {
        let user_requests = [];
        let ann_requests = [];

        User.remove()
            .then(() => {
                // insert all of the users
                for (let i = 0; i < dbUsers.length; i++) {
                    user_requests.push(User.Create(dbUsers[i])
                        .then(user => user.generateToken())
                        .then(user => user.updateOnlineStatus(CUser.STATUS_ONLINE))
                        .catch(err => console.log(err)));
                }
            })
            .then(() => Promise.all(user_requests))
            .then(() => Announcement.clear())
            .then(() => {
                // insert all of the announcement
                for (let i = 0; i < 11; i++) {
                    ann_requests.push(Announcement.addNewAnnouncement({
                        sender: dbUsers[i % 3].username,
                        content: "test" + 1
                    }).catch(err => console.log(err)));
                }
            })
            .then(() => Promise.all(ann_requests))
            .then(() => done())
            .catch(err => done(err));
    });

    test('Testing search announcement with vaild query and single page', done => {
        agent.get(HOST + search)
            .query({announcement: "test", page: 0})
            .end((err, res) => {
                expect(res.status).to.be(200);
                expect(_.size(res.body.message)).to.be(10);
                done();
            });
    });

    test('Testing search announcement with vaild query and multiple page', done => {
        // first page, should have exactly 10 page
        agent.get(HOST + search)
            .query({announcement: "test", page: 0})
            .end((err, res) => {
                expect(res.status).to.be(200);
                expect(_.size(res.body.message)).to.be(10);

                //second page, should be only 1 element
                agent.get(HOST + search)
                    .query({announcement: "test", page: 1})
                    .end((err, res) => {
                        expect(res.status).to.be(200);
                        expect(_.size(res.body.message)).to.be(1);

                        //third page, should be no element
                        agent.get(HOST + search)
                            .query({announcement: "test", page: 2})
                            .end((err, res) => {
                                expect(res.status).to.be(200);
                                expect(_.size(res.body.message)).to.be(0);
                                done();
                            });
                    });
            });
    });

    test('Testing search announcement with stop word only', done => {
        agent.get(HOST + search)
            .query({announcement: "a", page: 0})
            .end((err, res) => {
                expect(res.status).to.be(201);
                expect(_.size(res.body.message)).to.be(0);
                done();
            });
    });

    test('Testing search announcement with stop word only', done => {
        agent.get(HOST + search)
            .query({announcement: "a", page: 0})
            .end((err, res) => {
                expect(res.status).to.be(201);
                expect(_.size(res.body.message)).to.be(0);
                done();
            });
    });
});
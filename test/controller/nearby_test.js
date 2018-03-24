let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const Group = require('../../models/group');
const NearbyMessage = require('../../models/nearby_message');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');
const {dbGroups, newGroups} = require('../data/group_data');
const {dbMessages, newMessages} = require('../data/nearby_message_data');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;


suite('Nearby API Test', function () {
    let u1;
    let u2;

    setup(done => {
        // for every test, remove all of DB's current users and add Default Users for Testing
        User.remove({})
            .then(() => User.Create(dbUsers[0]))
            .then(user => user.generateToken())
            .then(user => {
                user.latitude = 44.0;
                user.longitude = 41.0;
                return user.save();
            })
            .then(user => u1 = user)
            .then(() => User.Create(dbUsers[1]))
            .then(user => user.generateToken())
            .then(user => u2 = user)
            .then(user => {
                user.latitude = 44.0;
                user.longitude = 41.0;
                return user.save();
            })
            .then(() => Group.clear())
            .then(() => NearbyMessage.clear())
            .then(() => done());
    });

    test('Testing get nearby users', done => {
        let data = {token: u1.token};
        agent.get(HOST + '/nearby/users')
            .query(data)
            .end(function (err, res) {
                let users = res.body.users;
                expect(res.status).to.be(200);
                expect(users.length).to.be(1);
                expect(users[0].username).to.be.eql(dbUsers[1].username);
                // expect(res.body.user.username).to.be(dbUsers[0].username);
                done();
            });
    });

    test('Testing form group chat', done => {
        let data = {token: u1.token, members: [u1.username,'bbb','ccc']};
        agent.post(HOST + '/nearby/groups')
            .send(data)
            .end(function (err, res) {
                let group = res.body.group;
                expect(res.status).to.be(200);
                expect(group.group_id).to.be.ok();
                done();
            });
    });

    test('Testing get nearby groups', done => {
        let data = {token: u1.token, members: [u1.username,'bbb','ccc']};
        agent.post(HOST + '/nearby/groups')
            .send(data)
            .end(function (err, res) {
                let group = res.body.group;
                expect(res.status).to.be(200);
                expect(group.group_id).to.be.ok();
                let data = {token: u1.token};
                agent.get(HOST + '/nearby/groups')
                    .query(data)
                    .end(function (err, res) {
                        let groups = res.body.groups;
                        expect(groups.length).to.be(1);
                        // expect(group.group_id).to.be.ok();
                        done();
                    });
            });
    });

    test('Testing dismiss group chat', done => {
        let data = {token: u1.token, members: [u1.username,'bbb','ccc']};
        agent.post(HOST + '/nearby/groups')
            .send(data)
            .end(function (err, res) {
                let group = res.body.group;
                expect(res.status).to.be(200);
                expect(group.group_id).to.be.ok();
                let data = {token: u1.token, group_id: group.group_id};
                agent.delete(HOST + '/nearby/groups')
                    .send(data)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        done();
                    });
            });
    });

    test('Testing dismiss group chat', done => {
        let data = {token: u1.token, members: [u1.username,'bbb','ccc']};
        agent.post(HOST + '/nearby/groups')
            .send(data)
            .end(function (err, res) {
                let group = res.body.group;
                expect(res.status).to.be(200);
                expect(group.group_id).to.be.ok();
                let data = {token: u1.token, group_id: group.group_id};
                agent.delete(HOST + '/nearby/groups')
                    .send(data)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        done();
                    });
            });
    });

    test('Testing post group messages', done => {
        let data = {token: u1.token, members: [u1.username,'bbb','ccc']};
        agent.post(HOST + '/nearby/groups')
            .send(data)
            .end(function (err, res) {
                let group = res.body.group;
                expect(res.status).to.be(200);
                expect(group.group_id).to.be.ok();
                let data = {token: u1.token, group_id: group.group_id, content: dbMessages[0].content};
                agent.post(HOST + '/nearby/messages')
                    .send(data)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        done();
                    });
            });
    });

    test('Testing get group messages', done => {
        let data = {token: u1.token, members: [u1.username,'bbb','ccc']};
        agent.post(HOST + '/nearby/groups')
            .send(data)
            .end(function (err, res) {
                let group = res.body.group;
                expect(res.status).to.be(200);
                expect(group.group_id).to.be.ok();
                let data = {token: u1.token, group_id: group.group_id};
                agent.get(HOST + '/nearby/messages')
                    .query(data)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        done();
                    });
            });
    });
});
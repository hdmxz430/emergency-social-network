require('../../models/db');
const _ = require('lodash');
const NearbyMessage = require('../../models/nearby_message');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');
const {dbMessages, newMessages} = require('../data/nearby_message_data');
let expect = require('expect.js');


suite('NearbyMessage Tests', function () {
    setup((done) => {
        User.remove({})
            .then(() => User.Create(dbUsers[0]))
            .then(user => user.generateToken())
            .then(() => User.Create(dbUsers[1]))
            .then(user => user.generateToken())
            .then(() => User.Create(dbUsers[3]))
            .then(user => user.generateToken())
            .then(() => NearbyMessage.clear())
            .then(() => done());
    });

    test('Testing post new message which is valid', done => {
        let m = dbMessages[0];
        NearbyMessage.postMessage(m)
            .then(message => {
                expect(message).to.be.eql(m);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing post new message which user is not in database', done => {
        let m = newMessages[0];
        NearbyMessage.postMessage(m)
            .then(message => {
                console.log(message);
                done('Should not go that way');
            })
            .catch(err => {
                expect(err).to.be.eql({"status": 401, "message": "No user found"});
                done();
            });
    });

    test('Testing get messages which is valid', done => {
        NearbyMessage.postMessage(dbMessages[0])
            .then(() => NearbyMessage.postMessage(dbMessages[1]))
            .then(() => NearbyMessage.postMessage(dbMessages[2]))
            .then(() => NearbyMessage.getLatestMessages(dbMessages[0].group_id))
            .then(messages => {
                expect(messages.length).to.be(2);
                expect(messages[0]).to.be.eql(dbMessages[0]);
                expect(messages[1]).to.be.eql(dbMessages[1]);
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    test('Testing get messages which user is not in database', done => {
        NearbyMessage.postMessage(dbMessages[0])
            .then(() => NearbyMessage.postMessage(newMessages[0]))
            .then(() => NearbyMessage.getLatestMessages(dbMessages[0].group_id))
            .then(messages => {
                done('Should not go that way');
            })
            .catch(err => {
                console.log(err);
                expect(err).to.be.eql({"status": 401, "message": "No user found"});
                done();
            });
    });

    test('Testing delete messages', done => {
        NearbyMessage.postMessage(dbMessages[0])
            .then(() => NearbyMessage.postMessage(dbMessages[1]))
            .then(() => NearbyMessage.deleteMessages(dbMessages[0].group_id))
            .then(() => NearbyMessage.getLatestMessages(dbMessages[0].group_id))
            .then((messages) => {
                expect(messages.length).to.be(0);
                done();
            })
            .catch(err => {
                console.log(err);
                expect(err).to.be.eql({"status": 401, "message": "No user found"});
                done();
            });
    });
});
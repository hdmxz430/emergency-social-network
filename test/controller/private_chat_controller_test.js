let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const message = require('../../models/private_message');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
let app = require('../../app').app;

app.set('testing', true);

let serverInitialized = function () {
    console.log('Express server listening on port ' + PORT);
};

app.listen(PORT, serverInitialized);

suite('Chat Private Tests', function () {
    let u1;
    let u2;

    setup(done => {
        // for every test, remove all of the users and register new users
        User.remove().then(() => {
            return message.clear();
        }).then(()=>{
            let user = _.pick(dbUsers[0], ['username', 'password']);
            return User.Create(user);
        }).then(user => {
            return user.generateToken();
        }).then(user => {
            u1 = {token: user.token, username: _.pick(user, ['username'])};
            let user2 = _.pick(dbUsers[1], ['username', 'password']);
            return User.Create(user2);
        }).then(user => {
            return user.generateToken();
        }).then(user => {
            u2 = {token: user.token, username: _.pick(user, ['username'])};
            return message.postMessage(dbUsers[0].username, dbUsers[1].username, "test1", "123456", 1);
        }).then(()=>{
            return message.postMessage(dbUsers[1].username, dbUsers[0].username, "test2", "123456", 1);
        }).then(()=>{
            done();
        }).catch(err => {
            done(err);
        });
    });

    test('Testing get history message with good query', function (done) {
        console.log(u1.username.username);
        agent.get(HOST + '/chat_private/messages')
            .query({user1:u1.username.username,user2:u2.username.username,token:u1.token})
            .end((err, res) => {
                expect(res.body.status).to.be(200);
                expect(_.size(res.body.historyMessage)).to.be(2);
                done();
            });
    });

    test('Testing get history message when one user is not existed ', function (done) {


        agent.get(HOST + '/chat_private/messages')
            .query({user1:"idk",user2:u2.username.username,token:u1.token})
            .end((err, res) => {

                expect(res.error.status).to.be(400);
                expect(res.body.message).to.be('user not found');
                done();
            });
    });

    test('Testing get history message both  users are not existed', done => {


        agent.get(HOST + '/chat_private/messages')
            .query({user1:"idk",user2:"idk2",token:u1.token})
            .end((err, res) => {

                expect(res.error.status).to.be(400);
                expect(res.body.message).to.be('user not found');
                done();
            });
    });
    test('Testing post message with good query', done => {


        agent.post(HOST + '/chat_private/messages')
            .send({sender:u1.username.username,receiver:u2.username.username,sender_status:1,content:"test",timestamp:"",token:u1.token})
            .end((err, res) => {

                expect(res.body.status).to.be(201);
                done();
            });
    });

    test('Testing post message when token does not match with sender', done => {


        agent.post(HOST + '/chat_private/messages')
            .send({sender:u1.username.username,receiver:u2.username.username,sender_status:1,content:"test",timestamp:"",token:u2.token})
            .end((err, res) => {
                expect(res.error.status).to.be(400);
                expect(res.body.message).to.be("token not matched with sender");
                done();
            });
    });
    test('Testing post message when receiver is not existed', done => {


        agent.post(HOST + '/chat_private/messages')
            .send({sender:u1.username.username,receiver:"idk",sender_status:1,content:"test",timestamp:"",token:u1.token})
            .end((err, res) => {
                expect(res.error.status).to.be(400);
                expect(res.body.message).to.be("receiver not found");
                done();
            });
    });
});
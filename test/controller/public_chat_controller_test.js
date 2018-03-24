let expect = require('expect.js');
let agent = require('superagent');
const path = require('path');

require('../../models/db');
const _ = require('lodash');
const message = require('../../models/message');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

// Initiate Server



suite('Chat Public Tests', function () {
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
            return message.postMessage("test1","",/*Empty Image*/ dbUsers[0].username,  "123456", 1);
        }).then(()=>{
            return message.postMessage("test2","",/*Empty Image*/ dbUsers[1].username,  "123456", 1);
        }).then(()=>{
            done();
        }).catch(err => {
            console.log(err);
            done();
        });
    });

    test('Testing get history message with good query', function (done) {
        agent.get(HOST + '/chat_public/messages')
            .query({token:u1.token})
            .end((err, res) => {
                // console.log(res);
                expect(res.body.status).to.be(200);
                expect(_.size(res.body.latestMessage)).to.be(2);
                done();
            });
    });

    test('Testing get history message without token', function (done) {


        agent.get(HOST + '/chat_public/messages')
            .query({})
            .end((err, res) => {
                // console.log(res);

                expect(res.error.status).to.be(401);
                expect(res.body.message).to.be('You do not have permission');
                done();
            });
    });

    test('Testing post message with good query', done => {


        agent.post(HOST + '/chat_public/messages')
            .send({username:u1.username.username,user_status:1,content:"test",timestamp:"1234",token:u1.token})
            .end((err, res) => {
                expect(res.status).to.be(201);
                done();
            });
    });

    test('Testing post Empty message', done => {
        /* No Pic, No Text */

        agent.post(HOST + '/chat_public/messages')
            .send({username:u1.username.username,user_status:1,content:"", image:"", timestamp:"1234",token:u1.token})
            .end((err, res) => {
                expect(res.status).to.be(400);
                expect(res.body.message).to.be("Empty Message");
                done();
            });
    });

    test('Testing post message when token does not match with sender', done => {


        agent.post(HOST + '/chat_public/messages')
            .send({username:u1.username.username,user_status:1,content:"test",timestamp:"1234",token:u2.token})
            .end((err, res) => {
                // console.log(res.err);
                expect(res.error.status).to.be(400);
                expect(res.body.message).to.be("token not matched with sender");
                done();
            });
    });

    test('Testing post message when without token', done => {


        agent.post(HOST + '/chat_public/messages')
            .send({username:u1.username.username,user_status:1,content:"test",timestamp:"1234"})
            .end((err, res) => {
                expect(res.error.status).to.be(401);
                expect(res.body.message).to.be("You do not have permission");
                done();
            });
    });

    /* Image Messages */
    test('Testing Post Image Message', function (done) {
        /* Upload Image First */

        agent.post(HOST+'/image/upload')
            .attach('logo', path.join(__dirname, "../file/", "testImg0.jpg"))
            .end((err, res) => {
                expect(res.status).to.be(200);
                //console.log(res.body.imgURL);
                let imgName = res.body.imgURL.split('-')[1];
                let imgURL = res.body.imgURL;
                expect(imgName).to.be("testImg0.jpg");
                agent.post(HOST + '/chat_public/messages')
                    .send({username:u1.username.username,user_status:1,content:"Image Message", image: imgURL,token:u1.token})
                    .end((err, res) => {
                        expect(res.status).to.be(201);
                        /* Return the Message List */
                        agent.get(HOST + '/chat_public/messages')
                            .query({token:u1.token})
                            .end((err, res) => {
                                console.log(res.body.latestMessage[0]);
                                expect(res.body.status).to.be(200);
                                /* Three Messages, First two are Normal Messages, The third One is Image Message*/
                                expect(_.size(res.body.latestMessage)).to.be(3);
                                expect(res.body.latestMessage[2].image).to.be(imgURL);
                                done();
                            });
                    });
            });
    });
});
let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const moment=require('moment');
const _ = require('lodash');
const poll = require('../../models/poll');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;


suite('Poll Tests', function () {
    let u1;
    let u2;
    let test_id;

    setup(done => {
        // for every test, remove all of the users and register new users
        User.remove().then(() => {
            return poll.clear();
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
            return poll.postPoll( 'test','this is a test' ,1611517720000,moment.now(),dbUsers[1].username,"a\nb\nc" );
        }).then((poll)=>{
            test_id=poll._id;
            done();
        }).catch(err => {
            done(err);
        });
    });

    test('Testing listing polls', function (done) {
        agent.get(HOST + '/poll/list')
            .query({token:u1.token})
            .end((err, res) => {
                expect(res.status).to.be(200);
                expect(_.size(res.body.polllist)).to.be(1);
                done();
            });
    });

    test('Testing getting detail of a poll', function (done) {

        agent.get(HOST + '/poll/polldetail')
            .query({id:test_id.toString(),token:u1.token})
            .end((err, res) => {

                expect(res.status).to.be(200);
                expect(res.body.poll._id).to.be(test_id.toString());
                done();
            });
    });

    test('Testing posting a new poll w/o error', done => {


        agent.post(HOST + '/poll')
            .send({username:u1.username.username,pollname:'test2',option:'aa\nbb',expire:1,token:u1.token,description:' '})
            .end((err, res) => {

                expect(res.status).to.be(201);
                done();
            });
    });
    test('Testing post a new poll w/o title', done => {


        agent.post(HOST + '/poll')
            .send({username:u1.username.username,pollname:' ',option:'aa\nbb',expire:1,token:u1.token})
            .end((err, res) => {

                expect(res.status).to.be(400);
                expect(res.body.message).to.be("Title cannot be empty");

                done();
            });
    });

    test('Testing post a new poll with 0 or 1 option', done => {


        agent.post(HOST + '/poll')
            .send({username:u1.username.username,pollname:'test3',option:'aa',expire:1,token:u1.token})
            .end((err, res) => {
                expect(res.error.status).to.be(400);
                expect(res.body.message).to.be("There should be at least 2 options");
                done();
            });
    });
    test('Testing voting w/o error', done => {


        agent.post(HOST + '/poll/vote')
            .send({username:u1.username.username,id:test_id,option:1,token:u1.token})
            .end((err, res) => {
                expect(res.status).to.be(200);
                done();
            });
    });

    test('Testing duplicate voting ', done => {


        agent.post(HOST + '/poll/vote')
            .send({username:u2.username.username,id:test_id,option:1,token:u2.token})
            .then(()=>{
            agent.post(HOST + '/poll/vote')
                .send({username:u2.username.username,id:test_id,option:1,token:u2.token})
                .end((err, res) => {
                    expect(res.status).to.be(400);
                    expect(res.body.message).to.be("You have voted");
                    done();})
        });
    });
});
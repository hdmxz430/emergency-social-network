let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');
const {CUser} = require('../../models/const');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

suite('Search Information API Test', function(){
    /*Integration tests that exercise 'search_info's' REST API are created here */

    setup(done => {
        // for every test, remove all of DB's current users and add Default Users for Testing
        User.remove().then(() => {
            let user0 = _.pick(dbUsers[0], ['username', 'password']);
            user0.user_status = 1; // OK
            let user1 = _.pick(dbUsers[1], ['username', 'password']);
            user1.user_status = 3; //Emergency
            let user2 = _.pick(dbUsers[2], ['username', 'password']);
            user2.user_status = 3; //Emergency
            let user3 = _.pick(dbUsers[3], ['username', 'password']);
            user3.user_status = 3; //Emergency
            User.Create(user0)
                .then(user => user.generateToken())
                .then(user => user.updateOnlineStatus(CUser.STATUS_OFFLINE))
                .then(() => {
                    User.Create(user1)
                        .then(user => user.generateToken())
                        .then(user => user.updateOnlineStatus(CUser.STATUS_OFFLINE))
                        .then(() => {
                            User.Create(user2)
                                .then(user => user.generateToken())
                                .then(user => user.updateOnlineStatus(CUser.STATUS_OFFLINE))
                                .then(() => {
                                    User.Create(user3)
                                        .then(user => user.generateToken())
                                        .then(user => user.updateOnlineStatus(CUser.STATUS_OFFLINE))
                                        .then(user => done())
                                        .catch(err => {
                                            console.log(err);
                                            expect().fail(err);
                                            done(err);
                                        });
                                });
                        });
                });
        });
    });

    test('Search by Username: one user found', function(done) {
        let search_word = {username : 'qiang', page: 0};
        agent.get(HOST+'/search_info/search_by_username')
            .query(search_word)
            .end(function(err, res){
                expect(res.status).to.be(200);
                expect(res.body.message.length).to.be(1);
                expect(res.body.message[0].username).to.be(dbUsers[0].username);
                expect(res.body.message[0].user_status).to.be(1);
                done();
            });

    });

    test('Search by Username: two user found', function(done) {
        let search_word = {username : 'zeyu', page: 0};
        agent.get(HOST+'/search_info/search_by_username')
            .query(search_word)
            .end(function(err, res){
                expect(res.status).to.be(200);
                expect(res.body.message.length).to.be(2);
                /* Here to test the alphabetical order of searchResult's user names; (Both Users are offline) */
                expect(res.body.message[0].username).to.be(dbUsers[1].username); // 'sunzeyu'
                expect(res.body.message[0].user_status).to.be(3);
                expect(res.body.message[1].username).to.be(dbUsers[2].username); // 'zhuzeyu'
                expect(res.body.message[1].user_status).to.be(3);
                done();
            });
    });

    test('Search by Username: two user found, one offline, one online', function(done) {
        let search_word = {username : 'zeyu', page: 0};
        /* First let 'zhuzeyu' get online */
        let user = {username: dbUsers[2].username, password: dbUsers[2].password, limit: 1};
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                // Assertion Statements here
                expect(res.status).to.be(200);
                expect(res.body.user.username).to.be(dbUsers[2].username);
                console.log('User Loged In');
                agent.get(HOST + '/search_info/search_by_username')
                    .query(search_word)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        expect(res.body.message.length).to.be(2);
                        /* Here to test the alphabetical order of searchResult's user names; (Both Users are offline) */
                        /* And citizens who are online are displayed with priority, followed by  citizens who are offline. */

                        expect(res.body.message[0].username).to.be(dbUsers[2].username); // 'zhuzeyu'
                        expect(res.body.message[0].user_status).to.be(3);
                        expect(res.body.message[1].username).to.be(dbUsers[1].username); // 'sunzeyu'
                        expect(res.body.message[1].user_status).to.be(3);
                        /* Here, alphabetically, 'sunzeyu' should be ahead of 'zhuzeyu', but 'zhuzeyu' is online */
                        done();
                    });
            });
    });

    test('Search by Status: more than one user found', function(done) {
        let search_word = {status: 3, page: 0};
        agent.get(HOST+'/search_info/search_by_status')
            .query(search_word)
            .end(function(err, res){
                expect(res.status).to.be(200);
                expect(res.body.message.length).to.be(3);
                /* Here to test the alphabetical order of searchResult's user names; (Both Users are offline) */
                expect(res.body.message[0].username).to.be(dbUsers[3].username); // 'jumbo'
                expect(res.body.message[0].user_status).to.be(3);
                expect(res.body.message[1].username).to.be(dbUsers[1].username); // 'sunzeyu'
                expect(res.body.message[1].user_status).to.be(3);
                expect(res.body.message[2].username).to.be(dbUsers[2].username); // 'zhuzeyu'
                expect(res.body.message[2].user_status).to.be(3);
                done();
            });
    });

    test('Search by Status: more than one user found, one of them is online', function(done) {
        let search_word = {status : 3, page: 0};
        /* First let 'zhuzeyu' get online */
        let user = {username: dbUsers[2].username, password: dbUsers[2].password, limit: 1};
        agent.get(HOST + '/users/auth')
            .query(user)
            .end(function (err, res) {
                // Assertion Statements here
                expect(res.status).to.be(200);
                expect(res.body.user.username).to.be(dbUsers[2].username);
                console.log('User Loged In');
                agent.get(HOST + '/search_info/search_by_status')
                    .query(search_word)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        expect(res.body.message.length).to.be(3);
                        /* Here to test the alphabetical order of searchResult's user names; (Both Users are offline) */
                        /* And citizens who are online are displayed with priority, followed by  citizens who are offline. */

                        expect(res.body.message[0].username).to.be(dbUsers[2].username); // 'zhuzeyu'
                        expect(res.body.message[0].user_status).to.be(3);
                        expect(res.body.message[1].username).to.be(dbUsers[3].username); // 'jumbo'
                        expect(res.body.message[1].user_status).to.be(3);
                        expect(res.body.message[2].username).to.be(dbUsers[1].username); // 'sunzeyu'
                        expect(res.body.message[2].user_status).to.be(3);
                        /* Here, alphabetically, 'sunzeyu' should be ahead of 'zhuzeyu', but 'zhuzeyu' is online */
                        done();
                    });
            });
    });

});
let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const primessage = require('../../models/private_message');
const pubmessage = require('../../models/message');
const {dbUsers} = require('../data/user_data');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;
let pubAdd = '/search_info/search_by_public_message';
let priAdd = '/search_info/search_by_private_message';

suite('Search Message Tests', function () {

    setup(done => {
        // for every test, remove all of the users and register new users
        primessage.clear().then(() => {
            return pubmessage.clear();
        }).then(() => {
            return pubmessage.postMessage("test1", "",/*Empty Image*/ dbUsers[0].username, "1", 1);
        }).then(() => {
            return pubmessage.postMessage("test2", "",/*Empty Image*/ dbUsers[1].username, "2", 1);
        }).then(() => {
            return pubmessage.postMessage("test3", "",/*Empty Image*/ dbUsers[1].username, "3", 1);
        }).then(() => {
            return pubmessage.postMessage("test4", "",/*Empty Image*/ dbUsers[1].username, "4", 1);
        }).then(() => {
            return pubmessage.postMessage("test5", "",/*Empty Image*/ dbUsers[1].username, "5", 1);
        }).then(() => {
            return pubmessage.postMessage("test6", "",/*Empty Image*/  dbUsers[1].username, "6", 1);
        }).then(() => {
            return pubmessage.postMessage("test7", "",/*Empty Image*/ dbUsers[1].username, "7", 1);
        }).then(() => {
            return pubmessage.postMessage("test8", "",/*Empty Image*/ dbUsers[1].username, "8", 1);
        }).then(() => {
            return pubmessage.postMessage("test9", "",/*Empty Image*/ dbUsers[1].username, "9", 1);
        }).then(() => {
            return pubmessage.postMessage("test10", "",/*Empty Image*/  dbUsers[1].username, "10", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test1", "1", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test2", "2", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test3", "3", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test4", "4", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test5", "5", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test6", "6", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test7", "7", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test8", "8", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[0].username, dbUsers[1].username, "test9", "9", 1);
        }).then(() => {
            return primessage.postMessage(dbUsers[1].username, dbUsers[0].username, "test10", "10", 1);
        }).then(() => {
            done();
        }).catch(err => {
            console.log(err);
            done();
        });
    });

    test('Testing search pub message with good query', function (done) {
        agent.get(HOST + pubAdd)
            .query({message: "test", page: 0})
            .end((err, res) => {
                expect(res.status).to.be(200);
                expect(_.size(res.body.message)).to.be(10);
                done();
            });
    });

    test('Testing search pub message with stop word only', function (done) {
        agent.get(HOST + pubAdd)
            .query({message: "a", page: 0})
            .end((err, res) => {
                // console.log(res);
                expect(res.status).to.be(201);
                expect(_.size(res.body.message)).to.be(0);
                done();
            });
    });

    test('Testing search pri message with good query', done => {
        agent.get(HOST + priAdd)
            .query({current_user: dbUsers[1].username, chat_mate: dbUsers[0].username, page: 0, message: "test"})
            .end((err, res) => {
                expect(res.status).to.be(200);
                expect(_.size(res.body.message)).to.be(10);
                done();
            });
    });

    test('Testing search pri message with stop word only', done => {
        agent.get(HOST + priAdd)
            .query({current_user: dbUsers[1].username, chat_mate: dbUsers[0].username, page: 0, message: "a"})
            .end((err, res) => {
                expect(res.status).to.be(201);
                expect(_.size(res.body.message)).to.be(0);
                done();
            });
    });
});
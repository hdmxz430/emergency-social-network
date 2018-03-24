require('../../models/db');
const User = require('../../models/user');
const {dbUsers, newUsers} = require('../data/user_data');
const bcrypt = require('bcryptjs');

let expect = require('expect.js');


suite('User Tests', function () {
    setup((done) => {
        User.remove({}).then(() => done());
    });

    test('Testing adding new User which is valid', done => {
        let rawUser = dbUsers[0];
        User.Create(rawUser)
            .then(user => user.save()) //following 'Promise'
            .then(user => { //Following '.save()' Promise
                // check username and status is correct
                expect(user.username).to.be.equal(rawUser.username);
                expect(user.user_status).to.be(0);
                // check password is hashed
                bcrypt.compare(rawUser.password, user.password, (err, res) => {
                    res === true ? done() : done(new Error('Password is not correct'));
                });
            }).catch(done);
    });

    test('Testing adding new User that has restricted name', function (done) {
        let rawUser = newUsers[0];
        User.Create(rawUser)
            .then(()=>{
                done(new Error('User should not be added'));
            }, err => {
                expect(err.errors.username).to.match(/ is not a valid username/);
                done();
            });
    });

    test('Testing adding new User that does not have required property', function (done) {
        let rawUser = newUsers[3];
        User.Create(rawUser)
            .then(()=>{
                done(new Error('User should not be added'));
            }, err => {
                expect(err.errors.username).to.match(/Path `username` is required/);
                done();
            });
    });

    test('Testing adding new User that has username less than 3', function (done) {
        let rawUser = newUsers[1];
        User.Create(rawUser)
            .then(()=>{
                done(new Error('User should not be added'));
            }, err => {
                expect(err.errors.username).to.match(/ is shorter than the minimum allowed length \(3\)/);
                done();
            });
    });

    test('Testing adding new User that password less than 4', function (done) {
        let rawUser = newUsers[2];
        User.Create(rawUser)
            .then(()=>{
                done(new Error('User should not be added'));
            }, err => {
                expect(err.errors.password).to.match(/ is shorter than the minimum allowed length \(4\)/);
                done();
            });
    });

});
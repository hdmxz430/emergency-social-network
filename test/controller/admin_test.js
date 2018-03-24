/* Also test for 'index_controller'*/
let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const User = require('../../models/user');
const {dbUsers, dbAdmins, dbCoordinators} = require('../data/user_data');
const {CUser} = require('../../models/const');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

// Initiate Server
// let app = require('../../app').app;
//
// app.set('testing', true);
//
// let serverInitialized = function () {
//     console.log('Express server listening on port ' + PORT);
// };
//
// app.listen(PORT, serverInitialized);

suite('Admin API Test', function () {

    setup(done => {
        // for every test, remove all of DB's current users and add Default Users for Testing
        let users = [];
        let admins = [];
        let coordinators = [];
        User.remove()
            .then(() => {
                // insert all of the users
                for (let i = 0; i < dbUsers.length; i++) {
                    users.push(User.Create(dbUsers[i])
                        .then(user => user.generateToken())
                        .catch(err => console.log(err)));
                }
            })
            .then(() => Promise.all(users))
            .then(() => {
                // insert all of the admins
                for (let i = 0; i < dbAdmins.length; i++) {
                    admins.push(User.Create(dbAdmins[i])
                        .then(user => user.generateToken())
                        .then(user => user.updatePrivilege(CUser.PRIVILEGE_ADMIN))
                        .then(user => user.updateUserStatus(CUser.USER_STATUS_OK))
                        .catch(err => console.log(err)));
                }
            })
            .then(() => Promise.all(admins))
            .then(() => {
                // insert all of the coordinators
                for (let i = 0; i < dbCoordinators.length; i++) {
                    admins.push(User.Create(dbCoordinators[i])
                        .then(user => user.generateToken())
                        .then(user => user.updatePrivilege(CUser.PRIVILEGE_COORDINATOR))
                        .catch(err => console.log(err)));
                }
            })
            .then(() => Promise.all(coordinators))
            .then(() => done())
            .catch(err => done(err));
    });

    // test('Testing Admin render list page', function (done) {
    //     let user = dbAdmins[0];
    //     login(user).then(data => {
    //         let user = data.user;
    //         agent.get(HOST+'/admins/userPage/')
    //             .query({token: data.token})
    //             .end(function (err, res) {
    //                 expect(res.status).to.be(200);
    //                 done();
    //             });
    //         done();
    //     }).catch(err => done(err));
    // });

    test('Testing Admin Login Successfully', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            let user = data.user;
            expect(user.username).to.be(dbAdmins[0].username);
            expect(user.privilege).to.be(CUser.PRIVILEGE_ADMIN);
            done();
        }).catch(err => done(err));
    });

    test('Testing Admin Get Full User List', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            agent.get(HOST + '/admins/users')
                .query({token: data.token})
                .end(function (err, res) {
                    expect(res.status).to.be(200);
                    let results = res.body.users;
                    results = results.map(user => _.pick(user, ['username', 'privilege']));
                    compareFullUserList(results);
                    done();
                });
        }).catch(err => done(err));
    });

    test('Testing User Get Full User List', function (done) {
        let user = dbUsers[0];
        login(user).then(data => {
            agent.get(HOST + '/admins/users')
                .query({token: data.token})
                .end(function (err, res) {
                    expect(res.body.message).to.be('You do not have permission');
                    expect(res.status).to.be(401);
                    done();
                });
        }).catch(err => done(err));
    });

    test('Testing Admin update account status invalid', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            login(dbUsers[0]).then(u => {
                // change account status, after that, the user changed should not login again
                let newAccountStatus = 10;
                let sendData = {
                    token: data.token,
                    user_id: u.user._id,
                    new_account_status: newAccountStatus,
                    action_num: 3
                };
                agent.post(HOST + '/admins/user')
                    .send(sendData)
                    .end(function (err, res) {
                        expect(res.status).to.be(400);
                        done();
                    });
            }).catch(err => done(err));
        }).catch(err => done(err));
    });

    test('Testing Admin which has action number error', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            login(dbUsers[0]).then(u => {
                // change account status, after that, the user changed should not login again
                let newAccountStatus = CUser.ACCOUNT_STATUS_INACTIVE;
                let sendData = {
                    token: data.token,
                    user_id: u.user._id,
                    new_account_status: newAccountStatus,
                    action_num: 10
                };
                agent.post(HOST + '/admins/user')
                    .send(sendData)
                    .end(function (err, res) {
                        expect(res.status).to.be(402);
                        done();
                    });
            }).catch(err => done(err));
        }).catch(err => done(err));
    });

    test('Testing Admin change password', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            let newPassword = 'abcdef';
            return login(dbUsers[0]).then(u => {
                let sendData = {
                    token: data.token,
                    user_id: u.user._id,
                    new_password: newPassword,
                    action_num: 2
                };
                agent.post(HOST + '/admins/user')
                    .send(sendData)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        let newUser = {username: u.user.username, password: newPassword};
                        login(newUser).then(data => {
                            expect(res.status).to.be(200);
                            done();
                        }).catch(err => done(err));
                    });
            });
        }).catch(err => done(err));
    });

    test('Testing Admin change username', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            let newName = 'abcdef';
            return login(dbUsers[0]).then(u => {
                let sendData = {
                    token: data.token,
                    user_id: u.user._id,
                    new_username: newName,
                    action_num: 1
                };
                agent.post(HOST + '/admins/user')
                    .send(sendData)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        expect(res.body.message).to.be('User updated successfully!');
                        let newUser = {username: newName, password: dbUsers[0].password};
                        login(newUser).then(data => {
                            done();
                        }).catch(err => done(err));
                    });
            });
        }).catch(err => done(err));
    });

    test('Testing Admin change account status', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            login(dbUsers[0]).then(u => {
                // change account status, after that, the user changed should not login again
                let newAccountStatus = CUser.ACCOUNT_STATUS_INACTIVE;
                let sendData = {
                    token: data.token,
                    user_id: u.user._id,
                    new_account_status: newAccountStatus,
                    action_num: 3
                };
                agent.post(HOST + '/admins/user')
                    .send(sendData)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        login(dbUsers[0]).then(data => {
                            done('Should not login');
                        }).catch(err => {
                            expect(err.response.body.message).to.be('Currently Your account is INACTIVE');
                            expect(err.response.body.status).to.be(401);
                            done();
                        })
                    });
            }).catch(err => done(err));
        }).catch(err => done(err));
    });

    test('Testing Admin change privilege level', function (done) {
        let user = dbAdmins[0];
        login(user).then(data => {
            login(dbUsers[0]).then(u => {
                let newPrivilege = CUser.PRIVILEGE_ADMIN;
                let sendData = {
                    token: data.token,
                    user_id: u.user._id,
                    new_privilege: newPrivilege,
                    action_num: 4
                };
                //change user privilege
                agent.post(HOST + '/admins/user')
                    .send(sendData)
                    .end(function (err, res) {
                        expect(res.status).to.be(200);
                        // changed user login
                        login(dbUsers[0]).then(data => {
                            expect(data.user.privilege).to.be(CUser.PRIVILEGE_ADMIN);
                            // the new admin should have privilege to get full list
                            agent.get(HOST + '/admins/users')
                                .query({token: data.token})
                                .end(function (err, res) {
                                    expect(res.status).to.be(200);
                                    let results = res.body.users;
                                    for(let user of results){
                                        if (user.username === dbUsers[0].username){
                                            expect(user.privilege).to.be(CUser.PRIVILEGE_ADMIN);
                                            break;
                                        }
                                    }
                                    done();
                                });
                        }).catch(err => done(err))
                    });
            }).catch(err => done(err));
        }).catch(err => done(err));
    });

    function login(user) {
        return new Promise((resolve, reject) => {
            agent.get(HOST + '/users/auth')
                .query(user)
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    // expect(res.status).to.be(200);
                    let data = res.body;
                    data.status = res.status;
                    resolve(data);
                });
        });
    }

    function compareFullUserList(results) {
        let admins = dbAdmins.map(users => users.username);
        admins.push('ESNAdmin');
        let coordinators = dbCoordinators.map(users => users.username);
        let users = dbUsers.map(users => users.username);
        for (let user of results) {
            if (user.privilege === CUser.PRIVILEGE_ADMIN) {
                expect(admins).to.be.contain(user.username)
            } else if (user.privilege === CUser.PRIVILEGE_COORDINATOR) {
                expect(coordinators).to.be.contain(user.username)
            } else {
                expect(users).to.be.contain(user.username)
            }
        }
    }
});
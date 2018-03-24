require('../../models/db');
const _ = require('lodash');
const Group = require('../../models/group');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');
const {dbGroups, newGroups} = require('../data/group_data');
let expect = require('expect.js');


suite('Group Tests', function () {
    setup((done) => {
        User.remove({})
            .then(() => User.Create(dbUsers[0]))
            .then(user => user.generateToken())
            .then(() => User.Create(dbUsers[1]))
            .then(user => user.generateToken())
            .then(() => Group.clear())
            .then(() => done());
    });

    test('Testing add new group chat which is valid initial user and members', done => {
        let rawGroup = dbGroups[0];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                expect(group.group_id).to.be.ok();
                delete group.group_id;
                expect(group).to.be.eql(rawGroup);
                done();
            }).catch(err => done(err));
    });

    test('Testing add new group chat which user is not in database', done => {
        let rawGroup = newGroups[0];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                done('Should not go that way');
            })
            .catch(err => {
                expect(err).to.be.eql({status: 401, message: 'No user found'});
                done();
            });
    });

    test('Testing add new group chat which do not have members', done => {
        let rawGroup = newGroups[1];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                done('Should not go that way');
            })
            .catch(err => {
                expect(err).to.be.eql({message: 'Do not have valid members'});
                done();
            });
    });

    test('Testing add new group chat which member size is not valid', done => {
        let rawGroup = newGroups[2];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                done('Should not go that way');
            })
            .catch(err => {
                expect(err).to.be.eql({message: 'Do not have valid members'});
                done();
            });
    });

    test('Testing add new group chat which members size is exceed the max limitation', done => {
        let rawGroup = newGroups[3];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                done('Should not go that way');
            })
            .catch(err => {
                expect(err).to.be.eql({message: 'Do not have valid members'});
                done();
            });
    });

    test('Testing add new group chat which initial user does not match with first member', done => {
        let rawGroup = newGroups[4];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                done('Should not go that way');
            })
            .catch(err => {
                expect(err).to.be.eql({message: 'Do not have valid members'});
                done();
            });
    });

    test('Testing get group chats which exists and length should be one', done => {
        let rawGroup = dbGroups[0];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                return Group.getGroupChats(rawGroup.initialUser);
            })
            .then(groups => {
                expect(groups.length).to.be(1);
                // there should be group_id and all other field should equal to rawGroup
                expect(groups[0].group_id).to.be.ok();
                delete groups[0].group_id;
                expect(groups[0]).to.be.eql(rawGroup);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing get group chats which exists and length should be two', done => {
        Group.formGroupChat(dbGroups[0].initialUser, dbGroups[0].groupName, dbGroups[0].members)
            .then(() => Group.formGroupChat(
                dbGroups[1].initialUser,
                dbGroups[1].groupName,
                dbGroups[1].members))
            .then(() => Group.getGroupChats(dbGroups[0].initialUser))
            .then(groups => {
                expect(groups.length).to.be(2);

                // there should be group_id and all other field should equal to dbGroup[0]
                expect(groups[0].group_id).to.be.ok();
                delete groups[0].group_id;
                expect(groups[0]).to.be.eql(dbGroups[0]);

                expect(groups[1].group_id).to.be.ok();
                delete groups[1].group_id;
                expect(groups[1]).to.be.eql(dbGroups[1]);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing get group chats which initialUser is not in database', done => {
        let rawGroup = dbGroups[0];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                return Group.getGroupChats('some one not in database');
            })
            .then(groups => {
                done('Should not go that way');
            })
            .catch(err => {
                expect(err).to.be.eql({"status":401,"message":"No user found"});
                done();
            });
    });

    test('Testing dismiss group chats which is valid', done => {
        let rawGroup = dbGroups[0];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                return Group.dismissGroupChat(group.group_id);
            })
            .then(() => {
                done();
            })
            .catch(err => {
                done(err);
            });
    });

    test('Testing dismiss group chats which group id is not in database', done => {
        let rawGroup = dbGroups[0];
        Group.formGroupChat(rawGroup.initialUser, rawGroup.groupName, rawGroup.members)
            .then(group => {
                return Group.dismissGroupChat('5a0aa33bc5ec650000000000');
            })
            .then(() => {
                done();
            })
            .catch(err => {
                expect(err).to.be.eql({message: 'Do not have that group chat'});
                done();
            });
    });

});
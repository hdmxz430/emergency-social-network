let expect = require('expect.js');

require('../../models/db');
const Announcement = require('../../models/announcement');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');
const {dbAnnouncements, newAnnouncements} = require('../data/announcement_data');

suite('Announcement Tests', () => {
    setup(done => {
        User.remove()
            .then(() => User.Create(dbUsers[0]))
            .then(user => user.generateToken())
            .then(() => Announcement.clear())
            .then(() => Announcement.addNewAnnouncement(dbAnnouncements[0]))
            .then(() => Announcement.addNewAnnouncement(dbAnnouncements[1]))
            .then(() => done());
    });

    test('Testing get latest announcement which has exactly 2 elements', done => {
        Announcement.getLatestAnnouncement(2)
            .then(announcements => {
                expect(announcements[0].sender).to.be(dbAnnouncements[1].sender);
                expect(announcements[0].content).to.be(dbAnnouncements[1].content);
                expect(announcements[1].sender).to.be(dbAnnouncements[0].sender);
                expect(announcements[1].content).to.be(dbAnnouncements[0].content);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing get latest announcement which has more elements than database have', done => {
        // should return exactly the same elements as database have
        Announcement.getLatestAnnouncement(45)
            .then(announcements => {
                expect(announcements[0].sender).to.be(dbAnnouncements[1].sender);
                expect(announcements[0].content).to.be(dbAnnouncements[1].content);
                expect(announcements[1].sender).to.be(dbAnnouncements[0].sender);
                expect(announcements[1].content).to.be(dbAnnouncements[0].content);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing get latest announcement which has less elements than database have', done => {
        Announcement.getLatestAnnouncement(1)
            .then(announcements => {
                expect(announcements[0].sender).to.be(dbAnnouncements[1].sender);
                expect(announcements[0].content).to.be(dbAnnouncements[1].content);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing get latest announcement which input is not valid', done => {
        Announcement.getLatestAnnouncement('String is not valid')
            .then(announcements => {
                expect(announcements[0].sender).to.be(dbAnnouncements[1].sender);
                expect(announcements[0].content).to.be(dbAnnouncements[1].content);
                expect(announcements[1].sender).to.be(dbAnnouncements[0].sender);
                expect(announcements[1].content).to.be(dbAnnouncements[0].content);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing get latest announcement which is empty', done => {
        Announcement.clear()
            .then(() => Announcement.getLatestAnnouncement())
            .then(announcements => {
                expect(announcements).to.be.eql([]);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing Add announcement successfully', done => {
        Announcement.addNewAnnouncement(dbAnnouncements[0])
            .then(announcement => {
                expect(announcement.sender).to.be(dbAnnouncements[0].sender);
                expect(announcement.content).to.be(dbAnnouncements[0].content);
                done();
            }).catch(done);
    });

    test('Testing Add announcement that sender\'s name are not in the database', done => {
        let a = newAnnouncements[0];
        Announcement.addNewAnnouncement(a)
            .then(announcement => {
                done({
                    announcement,
                    message: 'announcement should not be added'
                });
            }, err => {
                expect(err).to.be.ok();
                expect(err.status).to.be(400);
                expect(err.message).to.be(`user ${a.sender} is not in database`);
                done();
            })
            .catch(err => done(err));
    });

    test('Testing Add announcement that do not have content', done => {
        let a = newAnnouncements[1];
        Announcement.addNewAnnouncement(a)
            .then(announcement => {
                done({
                    announcement,
                    message: 'announcement should not be added'
                });
            }, err => {
                expect(err).to.be.ok();
                expect(err.errors.content.message).to.be('Path `content` is required.');
                done();
            })
            .catch(err => done(err));
    });
});
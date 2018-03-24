let expect = require('expect.js');
let agent = require('superagent');

require('../../models/db');
const _ = require('lodash');
const dangerous_zone = require('../../models/dangerous_zone');
const {dbDangerousZones} = require('../data/dangerous_zone_data');
const {newDangerousZones} = require('../data/dangerous_zone_data');
const User = require('../../models/user');
const {dbUsers} = require('../data/user_data');

let PORT = 3001;
let HOST = 'http://localhost:' + PORT;

suite('Dangerous Zone Tests', function () {
    let d1;

    setup(done => {
        // for every test, remove all of the users and register new users
        User.remove().then(() => {
            return dangerous_zone.clear();
        }).then(() => {
            let user = _.pick(dbUsers[0], ['username', 'password']);
            return User.Create(user);
        }).then((user) => {
            return user.generateToken();
        }).then(() => {
            let dz = _.pick(dbDangerousZones[0], ['lat', 'lng', 'description', 'timestamp']);
            return dangerous_zone.saveDangerousZone(dz.lat, dz.lng, dz.description, dz.timestamp);
        }).then(dangerousZone => {
           d1 = {lat: dangerousZone.lat, lng: dangerousZone.lng, description: dangerousZone.description, timestamp: dangerousZone.timestamp};
        }).then(()=>{
            done();
        }).catch(err => {
            done(err);
        });
    });

    test('Testing saveDangerousZone successfully', (done) => {
        let d2 = _.pick(newDangerousZones[0], ['lat', 'lng', 'description', 'timestamp']);
        agent.post(HOST + '/dangerous_zone/save_dangerous_zone')
            .send({lat: d2.lat, lng: d2.lng, description: d2.description, sender: 'mobo', timestamp: d2.timestamp})
            .end((err, res) => {
                expect(res.body.status).to.be(200);
                done();
            });
    });

    test('Testing saveDangerousZone fail', (done) => {
        let d2 = _.pick(newDangerousZones[1], ['lat', 'lng', 'description', 'timestamp']);
        agent.post(HOST + '/dangerous_zone/save_dangerous_zone')
            .send({lat: d2.lat, lng: d2.lng, description: d2.description, sender: 'mobo', timestamp: d2.timestamp})
            .end((err, res) => {
                expect(res.body.status).to.be(400);
                done();
            });
    });

    test('Testing getAroundDangerousZone with good query', (done) => {
        let d2 = _.pick(newDangerousZones[0], ['lat', 'lng', 'description', 'timestamp']);
        agent.get(HOST + '/dangerous_zone/show_dangerous_zone')
            .query({lat: d2.lat, lng: d2.lng})
            .end((err, res) => {
                expect(res.body.status).to.be(200);
                done();
            });
    });
});
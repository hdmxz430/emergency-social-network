require('../../models/db');
const _ = require('lodash');
const dangerous_zone = require('../../models/dangerous_zone');

let expect = require('expect.js');
let random_flag=Date.now().toString();
suite('Dangerous Zone Tests', function () {
    test('Testing adding new dangerous zone', function (done) {
        // Your assertion statements here
        dangerous_zone.saveDangerousZone(38.11111, -120.11111, 'fire emergency', 1510649158684.0).then(() => {
            expect(1).to.be.ok();
            done();
        }).catch((err) => {
            done(err);
        });
    });

    test('Get all dangerous zone', function (done) {
        // Your assertion statements here
        dangerous_zone.getAllDangerousZone().then((dangerousZoneList) => {
            let len = _.size(dangerousZoneList) - 1;
            expect(dangerousZoneList[len].get('lat')).to.eql('38.11111');
            expect(dangerousZoneList[len].get('lng')).to.eql('-120.11111');
            expect(dangerousZoneList[len].get('description')).to.eql('fire emergency');
            expect(dangerousZoneList[len].get('timestamp')).to.eql(1510649158684.0);
            done();
        }).catch((err) => {
            done(err);
        });
    });

});
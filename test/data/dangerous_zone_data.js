const {ObjectID} = require('mongodb');

let dangerousZoneId1 = new ObjectID();
//let dangerousZoneId2 = new ObjectID();

// users that already in the database
let dbDangerousZones = [{
    lat: '37.11111',
    lng: '-122.11111',
    description: 'fire',
    timestamp: 1510810900145.0,
    _id: dangerousZoneId1
}];

// users that not satisfied the requirement
let newDangerousZones = [{
    lat: '37.11211',
    lng: '-122.11211',
    description: 'flood',
    timestamp: 1510810902145.0,
}, {
    lat: '37.11111',
    lng: '-122.11111',
    description: 'typhoon',
    timestamp: 1510810922145.0,
}];

module.exports = {dbDangerousZones, newDangerousZones};
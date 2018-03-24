const {ObjectID} = require('mongodb');

let userId1 = new ObjectID();
let userId2 = new ObjectID();

// users that already in the database
let dbUsers = [{
    username: 'zeqiang',
    password: '123456',
    _id: userId1
}, {
    username: 'sunzeyu',
    password: '1223333',
    _id: userId2
}, {
    username: 'zhuzeyu',
    password: '111111',
}, {
    username: 'jumbo',
    password: '000000',
}];

let dbAdmins = [{
    username: 'AdminTest',
    password: 'admin',
}];

let dbCoordinators = [{
    username: 'coordinator',
    password: '123456',
}];

// users that not satisfied the requirement
let newUsers = [{
    username: 'add', //add is a restricted name
    password: 'asd113sd'
}, {
    username: ' s ', // username should at least 3 chars
    password: '123456'
}, {
    username: 'ad3d',
    password: '12e' // password should at least 4 chars
}, {
    name: 'ad3d',
    password: '12e233' // password should at least 4 chars
}, {
    username: 'jumbo',
    password: '111111' // Valid and Legal User
}];

module.exports = {dbUsers, dbAdmins, dbCoordinators, newUsers};
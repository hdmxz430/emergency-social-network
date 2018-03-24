const moment = require('moment');
const {ObjectID} = require('mongodb');

let id1 = new ObjectID().toHexString();
let id2 = new ObjectID().toHexString();
//vaildate messages
let dbMessages = [{
    username: 'zeqiang',
    group_id: id1,
    content: 'Hello, This is zeqiang',
    user_status: 3,
    timestamp: moment().subtract(10, 'days').valueOf()
}, {
    username: 'jumbo',
    group_id: id1,
    content: 'Hello, This is jumbo',
    user_status: 0,
    timestamp: moment().subtract(3, 'days').valueOf()
}, {
    username: 'jumbo',
    group_id: id2,
    content: 'Hello, This is jumbo',
    user_status: 0,
    timestamp: moment().subtract(3, 'days').valueOf()
}];

// messages that not satisfied the requirement
let newMessages = [{
    username: 'zeqiang1',
    group_id: id1,
    content: 'Hello, This is zeqiang',
    user_status: 3,
    timestamp: moment().subtract(10, 'days').valueOf()
}];


module.exports = {dbMessages, newMessages};
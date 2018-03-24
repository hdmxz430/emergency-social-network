const moment = require('moment');
const {dbUsers} = require('./user_data');

let dbAnnouncements = [
    {
        sender: dbUsers[0].username,
        content: 'This is a short content from ' + dbUsers[0].username,
        timestamp: moment().subtract(1, 'months').valueOf()
    }, {
        sender: dbUsers[0].username,
        content: 'This is a long content, ' +
        'This is a long content, ' +
        'This is a long content, ' +
        'This is a long content from ' + dbUsers[0].sender,
        timestamp: moment().valueOf()
    }, {
        sender: dbUsers[1].username,
        content: 'This is a long content, ' +
        'This is a long content, ' +
        'This is a long content, ' +
        'This is a long content from ' + dbUsers[1].sender,
        timestamp: moment().subtract(2, 'seconds').valueOf()
    },
];

let newAnnouncements = [
    {   //user is not in db
        sender: 'NotInDBUser',
        content: 'This is a short content from ' + dbUsers[0].sender,
        timestamp: moment().subtract(1, 'months').valueOf()
    },
    {   //do not have content
        sender: dbUsers[0].username,
        timestamp: moment().subtract(1, 'months').valueOf()
    }
];

module.exports = {dbAnnouncements, newAnnouncements};
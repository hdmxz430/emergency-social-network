const mongoose = require('mongoose');

// The config.json should not be added in production environment
if (process.env.NODE_ENV !== 'production') {
    // process.env.NODE_ENV could be 'test' or 'development'
    let env = process.env.NODE_ENV || 'development';
    process.env = Object.assign(process.env, require('./config.json')[env]);
}

let admin = require('./config.json')['INITIAL_USER'];
process.env = Object.assign(process.env, admin);
console.log(process.env.DB_URI);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URI, {useMongoClient: true})
    .catch(e => console.log(e));
console.log("db connection status:" ,mongoose.connection.readyState);

module.exports = {mongoose};
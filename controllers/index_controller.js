const _ = require('lodash');
const User = require('../models/user');
const {defaultErr} = require('./utils');
const {CUser} = require('../models/const');

let homepage = (req, res) => {
    res.render('login');
};

let directoryPage = (req, res) => {
    res.render('esn_directory');
};

let loginOrRegister = (req, res) => {
    let user = _.pick(req.query, ['username', 'password']);
    User.check(user.username, user.password)
        .then(user => loginHelper(user))
        .then(user => {
            res.send({token: user.token, user: user.toJSON()});
        })
        .catch(err => defaultErr(err, res));
};

let register = (req, res) => {
    let user = _.pick(req.body, ['username', 'password']);
    User.Create(user)
        .then(user => loginHelper(user))
        .then(user => {
            res.send({token: user.token, user: user.toJSON()});
        })
        .catch(err => defaultErr(err, res));
};

let loginHelper = (user) => {
    return user.generateToken()
        .then(user => user.updateOnlineStatus(CUser.STATUS_ONLINE))
};

let logout = (req, res) => {
    let user = req.user;
    user.removeToken()
        .then(() => user.updateOnlineStatus(CUser.STATUS_OFFLINE))
        .then(() => User.getVisibleUserList())
        .then(users => {
            const io = require('../app').io;
            io.emit('update', {users});
            res.send({});
            /* Update the User List in Admin Page */
            User.getFullUserList()
                .then(all_users => {
                    io.emit('update_admin', {all_users});
                })
        })
        .catch(err => defaultErr(err, res));
};

let getDirectoryList = (req, res) => {
    /* Here Invisible all Inactive Users */
    User.getVisibleUserList()
        .then(users => {
            const io = require('../app').io;
            //To set up a custom namespace, we call the 'of' function on the server-side:
            //On the client side, we tell Socket.IO client to connect to that namespace:
            io.emit('update', {users});
            res.send({users});
            /* Update the User List in Admin Page */
            User.getFullUserList()
                .then(all_users => {
                    io.emit('update_admin', {all_users});
                })
        })
        .catch(err => defaultErr(err, res));
};

module.exports = {
    homepage,
    directoryPage,
    loginOrRegister,
    register,
    logout,
    getDirectoryList
};

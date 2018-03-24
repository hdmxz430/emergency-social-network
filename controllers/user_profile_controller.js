const _ = require('lodash');
const {defaultErr} = require('./utils');
const moment = require('moment');
const User = require('../models/user');
const {CUser} = require('../models/const');

let userProfilePage = (req, res) => {
    res.render('user_profile', {title: 'Profile'});
};

let update_status = (req, res) => {
    let current_status = _.pick(req.body, ['user_status', 'latitude', 'longitude']);
    let user = req.user;
    if (current_status.user_status == 0) {
        res.status(400).send({user_status: 'You can not set the status to undefined'});
        return;
    }
    user.user_status = current_status.user_status;
    user.user_timestamp = moment.valueOf();
    if (current_status.latitude) {
        user.latitude = current_status.latitude;
        user.longitude = current_status.longitude;
    }

    let error = user.validateSync();

    if (error) {
        defaultErr(error, res);
    } else {
        user.updateUserStatus(current_status.user_status)
            .then(user => user.save())
            .then(() => User.getVisibleUserList())
            .then(users => {
                const io = require('../app').io; //For Now
                io.emit('update', {users});
                res.status(200).send({message: 'Update Successfully!'});
            }).catch(err => defaultErr(err, res));
    }
};

let update_warn = (req, res) => {
    let username = req.body.username;
    User.UpdateAllowWarn(username, req.body.warn)
        .then(() => {
            console.log('success');
            res.status(200).send({message: 'Update Successfully'});
        })
        .catch(err => defaultErr(err, res));

};
module.exports = {update_status, userProfilePage, update_warn};
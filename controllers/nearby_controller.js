const _ = require('lodash');
const moment = require('moment');
const User = require('../models/user');
const Group = require('../models/group');
const NearbyMessage = require('../models/nearby_message');
const {defaultErr} = require('./utils');

let nearbyUsersPage = (req, res) => {
    res.render('nearby_users', {title: 'Nearby Users'});
};

let nearbyChatPage = (req, res) => {
    res.render('nearby_chat', {title: 'Nearby Chats'});
};

let getNearbyUsers = (req, res) => {
    User.getNearbyUsers(req.user.username)
        .then(users => {
            res.send({users});
        }).catch(err => defaultErr(err, res));
};

let getNearbyGroups = (req, res) => {
    Group.getGroupChats(req.user.username)
        .then(groups => {
            res.send({groups});
        }).catch(err => defaultErr(err, res));
};

let formGroupChats = (req, res) => {
    let members = req.body.members;
    if (!members) {
        return defaultErr({message: 'Do not have members'}, res);
    }

    let groupName = members.join(',');
    Group.formGroupChat(req.user.username, groupName, members)
        .then(group => {
            const io = require('../app').io;
            io.emit('update_groups');
            res.send({group});
        }).catch(err => defaultErr(err, res));
};

let dismissGroupChats = (req, res) => {
    Group.dismissGroupChat(req.body.group_id)
        .then(() => {
            const io = require('../app').io;
            io.emit(req.body.group_id+'disconnected');
            res.send({});
        }).catch(err => defaultErr(err, res));
};

let getGroupMessages = (req, res) => {
    let group_id = req.query.group_id;
    Group.userHasGroup(group_id)
        .then(() => NearbyMessage.getLatestMessages(group_id))
        .then(messages => {
            res.send({messages});
        }).catch(err => defaultErr(err, res));
};

let postGroupMessages = (req, res) => {
    let content = ( req.body.content === undefined) ? "" : req.body.content;
    let image = (req.body.image === undefined) ? "" : req.body.image;
    let message = {
        username: req.user.username,
        group_id: req.body.group_id,
        content: content,
        image: image,
        timestamp: moment().valueOf(),
        user_status: req.user.user_status
    };
    NearbyMessage.postMessage(message)
        .then(message => {
            const io = require('../app').io;
            io.emit(message.group_id, message);
            res.send({message});
        }).catch(err => defaultErr(err, res));
};

module.exports = {
    nearbyUsersPage,
    nearbyChatPage,
    getNearbyUsers,
    getNearbyGroups,
    formGroupChats,
    dismissGroupChats,
    getGroupMessages,
    postGroupMessages
};

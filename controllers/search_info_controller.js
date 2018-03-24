const User = require('../models/user');
const Annoucement = require('../models/announcement');
const PubMessage = require('../models/message');
const PriMessage = require('../models/private_message');
const {_analyzer} = require('../models/englishStopWords');
const {defaultErr} = require('./utils');

const limit_number = 10;

let searchUserByUsername = (req, res) => {
    let username = req.query.username;
    let page = req.query.page;
    let username_list_after_filter = _analyzer(username);
    if (username_list_after_filter == '') {
        return res.status(201).send({message: []});
    }
    let skip_number = page * limit_number;

    User.findByUsername(username_list_after_filter, skip_number, limit_number)
        .then(function (userList) {
            userListHelper(userList, res);
        });
};

let searchUserByStatus = (req, res) => {
    let status = req.query.status;
    let page = req.query.page;
    let skip_number = page * limit_number;
    User.findByStatus(status, skip_number, limit_number)
        .then(function (userList) {
            userListHelper(userList, res);
        });

};

let userListHelper = (userList, res) => {
    if (userList.length === 0) {
        return res.status(201).send({message: []});
    }
    res.status(200).send({message: userList});
};

let searchAnnoucementByAnnounce = (req, res) => {
    let announcement = req.query.announcement;
    let page = req.query.page;
    let announcement_list_after_filter = _analyzer(announcement);
    if (announcement_list_after_filter == '') {
        return res.status(201).send({message: []});
    }
    let skip_number = page * limit_number;
    Annoucement.findByAnnouncement(announcement_list_after_filter, skip_number, limit_number)
        .then(function (announcement) {
            res.status(200).send({message: announcement});
        }).catch(err => defaultErr(err, res));
};

let searchPubMessageByMessage = (req, res) => {
    let pubMessage = req.query.message;
    let page = req.query.page;
    let skip_number = page * limit_number;
    let message_list_after_filter = _analyzer(pubMessage);
    if (message_list_after_filter == '') {
        return res.status(201).send({message: []});
    }

    PubMessage.findByPublicMessage(message_list_after_filter, skip_number, limit_number).then(function (messageList) {
        res.status(200).send({message: messageList});
    });
};

let searchPriMessageByMessage = (req, res) => {
    let priMessage = req.query.message;
    let page = req.query.page;
    let current_user = req.query.current_user;
    let chat_mate = req.query.chat_mate;
    let skip_number = page * limit_number;
    let message_list_after_filter = _analyzer(priMessage);
    if (message_list_after_filter == '') {
        return res.status(201).send({message: []});
    }
    PriMessage.findByPrivateMessage(message_list_after_filter, skip_number, limit_number, current_user, chat_mate).then(function (messageList) {
        res.status(200).send({message: messageList});
    });
};

module.exports = {
    searchUserByUsername,
    searchUserByStatus,
    searchAnnoucementByAnnounce,
    searchPubMessageByMessage,
    searchPriMessageByMessage
};
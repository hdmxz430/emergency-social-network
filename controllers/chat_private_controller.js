const _ = require('lodash');
let User = require('../models/user');
const private_message = require("../models/private_message");
const moment = require("moment");

let getHistoryMessage = (req, res) => {
    let user1 = req.query.user1;
    let user2 = req.query.user2;
    User.findOne({username: user1}).then(user => {
        if (!user) {
            return Promise.reject("user not found");
        } else {
            return User.findOne({username: user2});
        }
    }).then(user => {
        if (!user) {
            return Promise.reject("user not found");
        } else {
            return private_message.getHistoryMessageList(user1, user2);
        }
    }).then(function (messagelist) {
        res.send({status: 200, historyMessage: messagelist});
    }).catch(err => {
        console.log(err);
        res.status(400).send({message: err});
    });

};

let postMessage = (req, res) => {
    let sender = req.body.sender;
    let receiver = req.body.receiver;
    let sender_status = req.body.sender_status;
    let content = req.body.content;
    let timestamp = moment.now().valueOf();
    let token = req.body.token;
    const io = require('../app').io;
    console.log(req.body);
    User.findByToken(token).then(function (user) {
        if (!(user.get("username") === sender)) {
            return Promise.reject("token not matched with sender");
        } else {
            return User.findOne({username: receiver});
        }
    }).then(user => {
        if ((!user) || !(user.get("username") === receiver)) {
            return Promise.reject("receiver not found");
        }
        else {
            return private_message.postMessage(sender, receiver, content, timestamp, sender_status);
        }
    }).then(function () {
        res.status(201).send({status: 201});
        let para = (sender > receiver) ? (sender + receiver) : (receiver + sender);
        io.emit("message posted" + para, {sender, receiver, content, sender_status, timestamp});
        io.emit("notify receiver" + receiver, {sender: sender});
    }).catch(function (err) {
        console.log("-----------", err);
        res.status(400).send({message: err});
    });
};

let gotoChatPrivate = (req, res) => {
    let currentUser = _.pick(req.user, ['username']);
    console.log("currentUser is:-------------------" + currentUser.username);
    res.render('chat_private', {currentUser: currentUser.username});
};

module.exports = {
    getHistoryMessage,
    postMessage,
    gotoChatPrivate
};


const _ = require('lodash');
const message = require("../models/message");
let User = require('../models/user');
const moment = require("moment");

let gotoChatPublic = (req, res) => {
    let currentUser = _.pick(req.user, ['username']);
    res.render('chat_public', {currentUser: currentUser.username});
};

let getMessageList = (req, res) => {
    message.getlatestMessageList().then(function (messagelist) {
        res.send({status: 200, latestMessage: messagelist});
    }).catch(err => {
        res.status(500).send({message: err});
    });
};

let postMessage = (req, res) => {
    let username = req.body.username;
    let timestamp = moment.now().valueOf();
    let status = req.body.user_status;
    let content = ( req.body.content === undefined) ? "" : req.body.content;
    let image = (req.body.image === undefined) ? "" : req.body.image;
    let token = req.body.token;
    console.log(req.body);
    if((image == "") && (content == "")){
        return res.status(400).send({message: "Empty Message"});
    }
    const io = require('../app').io; //For Now
    User.findByToken(token).then(function (username_) {
        console.log(username_.get("username"));
        if (!(username === username_.get("username"))) {
            return Promise.reject("token not matched with sender");
        } else {
            return message.postMessage(content, image, username, timestamp, status);
        }
    }).then(function (message) {
        let messageReq = _.pick(message, ['username', 'content', 'image', 'user_status', 'timestamp']);
        io.emit("message posted", messageReq);
        res.status(201).send({message: messageReq});
    }).catch(function (err) {
        console.log(err);
        res.status(400).send({message: err});
    });
};

module.exports = {gotoChatPublic, postMessage, getMessageList};

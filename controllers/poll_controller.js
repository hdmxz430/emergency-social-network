const _ = require('lodash');
const poll = require("../models/poll");
let User = require('../models/user');
const moment = require("moment");

let gotoPoll= (req, res) => {
    let currentUser = _.pick(req.user, ['username']);
    res.render('poll', {currentUser: currentUser.username});
};
let gotoPolldetail= (req, res) => {
    let currentUser = _.pick(req.user, ['username']);
    res.render('poll_detail', {currentUser: currentUser.username});
};

let getPollList = (req, res) => {
    poll.getPollList().then(function (polllist) {
        res.status(200).send({ polllist: polllist});
    }).catch(err => {
        res.status(500).send({message: err});
    });
};
let getPollDetail = (req, res) => {
    poll.findByID(req.query.id).then(function (poll) {
        res.send({status: 200, poll: poll});
    }).catch(err => {
        res.status(500).send({message: err});
    });
};

let postPoll = (req, res) => {
    let created_by = req.body.username;
    let created_at = moment.now().valueOf();
    let description = req.body.description;
    let opt = req.body.option;
    let token = req.body.token;
    let pollname=req.body.pollname;
    let expire=req.body.expire;
    const io = require('../app').io; //For Now
    User.findByToken(token).then(function (username_) {
        if (!(created_by === username_.get("username"))) {
            return Promise.reject("token not matched with sender");
        } else {
            let options=opt.trim().split("\n");
            if(options.length<=1){
                return Promise.reject("There should be at least 2 options");
            }
            if(pollname.trim()===''){
                return Promise.reject("Title cannot be empty");
            }
            return poll.postPoll(pollname,description,expire,created_at,created_by,options);
        }
    }).then(function (p) {
        io.emit("poll posted", "1");
        res.status(201).send({});
    }).catch(function (err) {
        console.log(err);
        res.status(400).send({message: err});
    });
};

let vote = (req, res) => {
    let username = req.body.username;
    let token = req.body.token;
    let id=req.body.id;
    let time=moment.now().valueOf();
    let option=req.body.option;
    const io = require('../app').io;
    User.findByToken(token).then(function (username_) {
        if (!(username === username_.get("username"))) {
            return Promise.reject("token not matched with sender");
        } else {
            return poll.findByID(id).then((poll_)=>{
                if(time>poll_.timestamp){
                    return Promise.reject("This poll is expired");
                }
                for(let i=0;i<poll_.voted.length;i++){
                    if(poll_.voted[i]===username){
                        return Promise.reject("You have voted");
                    }
                }
                return poll.votePoll(id,username,option);
            })
        }
    }).then(function (p) {
        io.emit("vote "+id, "1");
        res.status(200).send({});
    }).catch(function (err) {
        console.log(err);
        res.status(400).send({message: err});
    });
};

module.exports = {gotoPoll,gotoPolldetail,vote,postPoll,getPollList,getPollDetail};

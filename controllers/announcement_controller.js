const _ = require('lodash');
const Announcement = require("../models/announcement");
const {defaultErr} = require('./utils');

let AnnouncementPage = (req, res) => {
    res.render('announcement', {title: 'Announcement'});
};

let getLatestAnnouncement = (req, res) => {
    let limit = req.query.limit;

    Announcement.getLatestAnnouncement(limit)
        .then((announcements) => {
            if (announcements && announcements.length > 0) {
                announcements = announcements.map(announcement => {
                    return _.pick(announcement, ['sender', 'content', 'timestamp']);
                });
                res.status(200).send({announcements});
            }else {
                res.sendStatus(204);
            }
        })
        .catch(err => defaultErr(err, res));
};

let postAnnouncement = (req, res) => {
    console.log("called");
    let announcement = _.pick(req.body, ['sender', 'content']);
    console.log(announcement);
    console.log(req.user.username);

    if (req.user.username !== announcement.sender){
        return res.status(401).send({message: 'You do not have permission'});
    }
    const io = require('../app').io;
    Announcement.addNewAnnouncement(announcement)
        .then(announcement => {
            let pick = _.pick(announcement, ['sender', 'content', 'timestamp']);
            io.emit("announcement posted", pick);
            res.send({message: 'New Announcement Created', announcement: pick});
        })
        .catch(defaultErr);
};

module.exports = {AnnouncementPage, getLatestAnnouncement, postAnnouncement};

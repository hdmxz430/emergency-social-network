const mongoose = require('mongoose');
const moment = require('moment');
const User = require('./user');

let AnnouncementSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    }, content: {
        type: String,
        required: true
    }, timestamp: {
        type: Number,
        required: true
    }
});

class AnnouncementHelper {
    constructor() {
        this.AnnouncementModel = mongoose.model('Announcement', AnnouncementSchema);
    }

    addNewAnnouncement({sender, content}) {
        let timestamp = moment().valueOf();
        return User.findOne({username: sender})
            .then(user => {
                if (!user) {
                    return Promise.reject({
                        status: 400,
                        message: `user ${sender} is not in database`
                    });
                }
                let announcement = new this.AnnouncementModel({sender, content, timestamp});
                return announcement.save();
            });
    }

    // return latest n announcement
    getLatestAnnouncement(limit) {
        limit = (!limit || limit < 0) ? 0 : parseInt(limit); // ensure limit value is valid
        return this.AnnouncementModel
            .find()
            .sort({"timestamp": -1})
            .limit(limit);
    }

    findByAnnouncement(annouce_list, skip_number, limit_number) {
        let query = [];
        console.log(annouce_list);
        for (let i = 0; i < annouce_list.length; i++) {
            let qs = new RegExp(annouce_list[i], 'i');
            query[i] = {'content': qs};
        }
        return this.AnnouncementModel.find({'$or': query})
            .limit(limit_number)
            .skip(skip_number)
            .sort({timestamp: -1})
            .then((announcementList) => {
                return announcementList;
            });
    }

    clear() {
        return this.AnnouncementModel.remove({});
    }
}

let Announcement = new AnnouncementHelper();

module.exports = Announcement;
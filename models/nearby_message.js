const mongoose = require('mongoose');
const User = require('../models/user');
const Group = require('../models/group');
let NearbyMessageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    group_id: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    content: {
        type: String,
        required: false,
        trim: true
    },
    image:  {
        type: String,
        required: false,
        trim: true
    },
    user_status: {
        type: Number,
        required: true,
        trim: true
    },
    timestamp: {
        type: Number,
        required: true,
        trim: true
    }
});

NearbyMessageSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
    }
});

class NearbyMessageHelper {
    constructor() {
        this.MessageModel = mongoose.model('NearbyMessage', NearbyMessageSchema);
    }

    getLatestMessages(group_id) {
        if (!group_id)
            return Promise.reject({message: 'Do not have group_id'});
        return this.MessageModel
            .find({group_id})
            .then(messages => messages.map(m => m.toJSON()));
    }

    postMessage(message) {
        let new_msg = new this.MessageModel({
            username: message.username,
            group_id: message.group_id,
            content: message.content,
            image: message.image,
            timestamp: message.timestamp,
            user_status: message.user_status
        });
        return User.findOneByUsername(message.username)
            .then(() => new_msg.save())
            .then(message => message.toJSON());
    }

    deleteMessages(group_id){
        return this.MessageModel.remove({group_id});
    }

    clear() {
        return this.MessageModel.remove();
    }
}

let NearbyMessage = new NearbyMessageHelper();

module.exports = NearbyMessage;



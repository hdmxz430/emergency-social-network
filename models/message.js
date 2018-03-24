const mongoose = require('mongoose');

let MessageSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        minlength: 3
    },
    content: {
        type: String,
        trim: true
    },
    image:  {
        type: String,
        trim: true
    },
    user_status: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Number,
        required: true,
        trim: true
    }
});

class Message {
    constructor() {
        this.MessageModel = mongoose.model('Message', MessageSchema);
    }

    getlatestMessageList() {
        return this.MessageModel.find();
    }

    postMessage(content, image, username, timestamp, user_status) {
        let new_msg = new this.MessageModel({
            username,
            content,
            image,
            timestamp,
            user_status
        });

        return new_msg.save();
    }

    findByPublicMessage(message_list, skip_number, limit_number){
        let query = new Array();
        for(let i = 0; i < message_list.length; i++){
            let qs = new RegExp(message_list[i], 'i');
            query[i] = {'content': qs};
        }

        return this.MessageModel.find({'$or': query}).limit(limit_number).skip(skip_number).sort({timestamp: -1}).then((messageList) =>{
            return messageList;
        });
    }

    clear(){
        return this.MessageModel.remove();
    }
}

let Messager = new Message();
module.exports = Messager;
const mongoose= require('mongoose');

let PrivateMessageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    receiver: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender_status: {
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

PrivateMessageSchema.methods.getinfo=function(){
    return {sender:this.sender, receiver:this.receiver, content:this.content, sender_status:this.sender_status, timestamp:this.timestamp};
};

class PrivateMessage{
    constructor(){
        this.MessageModel = mongoose.model('PrivateMessage', PrivateMessageSchema);
    }

    getHistoryMessageList(usr1, usr2){
        let query = {'$or': [{'sender': usr1, 'receiver': usr2},{'sender': usr2, 'receiver':usr1}]};
        return this.MessageModel.find(query);
    }

    postMessage(sender, receiver, content, timestamp, sender_status){
        let new_msg=new this.MessageModel({sender, receiver, content, timestamp, sender_status});
        return new_msg.save();
    }

    findByPrivateMessage(message_list, skip_number, limit_number, current_user, chat_mate){
        let query = [];
        for(let i = 0; i < message_list.length; i++){
            let qs = new RegExp(message_list[i], 'i');
            query[i] = {'content': qs};
        }
        
        let query1 = [];
        query1[0] = {'sender': current_user, 'receiver': chat_mate};
        query1[1] = {'receiver': current_user, 'sender': chat_mate};

        return this.MessageModel.find({$and: [{$or: query}, {$or: query1}]}).limit(limit_number).skip(skip_number).sort({timestamp: -1}).then((messageList) =>{
            return messageList;
        });
    }

    clear(){
        return this.MessageModel.remove();
    }
}

let PrivateMessager=new PrivateMessage();
module.exports = PrivateMessager;



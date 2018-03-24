const mongoose = require('mongoose');
let PollSchema = new mongoose.Schema({
    pollname: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true
    },
    options: [String],
    vote_num:[Number],
    voted:[String],
    timestamp: {
        type: Number,
        required: true,
    },
    created_at: {
        type: Number,
        required: true,
    },
    created_by:{
        type: String,
        required: true,
        trim: true
    }
});

class Poll {
    constructor() {
        this.PollModel = mongoose.model('Poll', PollSchema);
    }

    getPollList() {
        return this.PollModel.find().sort({created_at:-1});
    }

    postPoll( pollname,description ,timestamp,created_at,created_by,options ) {
        let vote_num=[];
        for(let i =0;i<options.length;i++){
            vote_num.push(0);
        }
        let voted=[];
        let new_poll = new this.PollModel({
            pollname,
            description,
            options,
            vote_num,
            voted,
            timestamp,
            created_at,
            created_by
        });

        return new_poll.save();
    }
    votePoll(poll_id,username,option){
        this.PollModel.findOne({_id:poll_id},function (err,poll) {
            if(err){
                console.log(err);
            }
            poll.vote_num.set(option, poll.vote_num[option]+1);
            poll.voted.push(username);
            poll.save();
        });
    }
    findByID(id){
        return this.PollModel.findOne({_id:id});
    }


    clear(){
        return this.PollModel.remove();
    }
}

let _Poll = new Poll();
module.exports = _Poll;
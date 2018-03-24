const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');
const moment = require('moment');
const User = require('./user');
const NearbyMessage = require('./nearby_message');

let GroupSchema = new mongoose.Schema({
    initialUser: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
    },
    groupName: {
        type: String,
    },
    members: [
        {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
        }
    ]
});

GroupSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        ret.group_id = ret._id.toHexString();
        delete ret._id;
        delete ret.__v;
    }
});

class GroupHelper {
    constructor() {
        this.GroupModel = mongoose.model('Group', GroupSchema);
    }

    // form the group chat
    // the members should be at least 2 people and at most 5 people
    // we assume the first member is the initial user
    // besides, if the initial user is not in database, it is invalid
    // by default, the groupName is the concatenation of members
    formGroupChat(initialUser, groupName, members) {
        if (members == undefined || members.length < 2 || members.length > 5 || members[0] !== initialUser) {
            return Promise.reject({message: 'Do not have valid members'});
        }
        return User.findOneByUsername(initialUser)
            .then(user => {
                return this.GroupModel.findOne({initialUser, groupName});
            }).then(group => {
                if (!group) {
                    let newGroup = new this.GroupModel({initialUser, groupName, members});
                    return newGroup.save().then(group => group.toJSON());
                } else {
                    return Promise.reject({message: 'Can not form two identical group'});
                }
            });
    }

    userHasGroup(group_id) {
        return this.GroupModel.findOne({_id: group_id})
            .then(group => {
                return new Promise((resolve, reject) => {
                    if (group) {
                        resolve(group);
                    } else {
                        reject({message: 'This group id is not valid'});
                    }
                });
            });
    }

    getGroupChats(initialUser) {
        return User.findOneByUsername(initialUser)
            .then(user => {
                return this.GroupModel.find({members: initialUser});
            })
            .then(groups => {
                groups = groups.map(group => {
                    return group.toJSON();
                });
                return groups;
            });
    }

    dismissGroupChat(groupId) {
        return NearbyMessage.deleteMessages(groupId)
            .then(() => this.GroupModel.findOne({_id: groupId}))
            .then(group => {
                if (group) {
                    return group.remove();
                } else {
                    return Promise.reject({message: 'Do not have that group chat'});
                }
            });
    }

    clear() {
        return this.GroupModel.remove({});
    }
}


let Group = new GroupHelper();

// Group.getGroupChats('zeq')
//     .then(groups => {
//         console.error(groups);
//     })
//     .catch(err => console.error(err));
// Group.formGroupChat('zeq', 'zeqiang', ['zeq', 'aaa'])
//     .then(group => {
//         console.log(group);
//         Group.dismissGroupChat(group.group_id).catch(err => console.error(err));
//     }).catch(err => console.error(err));
// User.getNearbyUsers('zzz')
//     .then(users => {
//         console.log(users);
//     })
//     .catch(err => console.log(err));
// Group.dismissGroupChat('5a0a94a082ba0303d6166c89').catch(err => console.error(err));

module.exports = Group;
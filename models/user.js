const mongoose = require('mongoose');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const moment = require('moment');
const dis = require('../controllers/distance');
const {CUser} = require('./const');
const geodist = require('geodist');
const UserSchema = require('./user_schema');

const DEFAULT_DISTANCE_MILE = 5;

require('./db');

UserSchema.methods.generateToken = function () {
    let user = this;
    user.token = jwt.sign({
        _id: user._id.toHexString()
    }, process.env.SALT).toString();
    return user.save();
};

UserSchema.methods.removeToken = function () {
    let user = this;
    return user.update({
        $set: {
            token: undefined
        }
    });
};

UserSchema.methods.updateUserStatus = function (status) {
    let user = this;
    user.user_status = status;
    return user.save();
};

UserSchema.methods.updateOnlineStatus = function (status) {
    let user = this;
    user.online_status = status;
    return user.save();
};

UserSchema.methods.updatePrivilege = function (privilege) {
    let user = this;
    user.privilege = privilege;
    return user.save();
};

UserSchema.methods.updateAccountStatus = function (status) {
    let user = this;
    user.account_status = status;
    return user.save();
};

UserSchema.statics.getNearbyUsers = function (initialUser) {
    let currentUser = null;
    return User.findOneByUsername(initialUser)
        .then(user => {
            currentUser = user;
            if (currentUser.longitude === undefined) {
                return Promise.reject('Current User does not share location');
            }
            return User.find({
                latitude: {$exists: true},
                longitude: {$exists: true},
                username: {$ne: currentUser.username}
            });
        })
        .then(users => {
            users = users.filter(user => {
                let distance = geodist({lat: user.latitude, lon: user.longitude},
                    {lat: currentUser.latitude, lon: currentUser.longitude});
                return distance <= DEFAULT_DISTANCE_MILE;
            });
            return users.map(user => user.toJSON());
        });
};

let sort_user_func = (o1, o2) => {
    if(!(o1.account_status && o2.account_status)){
        if (o1.account_status && !o2.account_status)
            return -1;
        if (!o1.account_status && o2.account_status)
            return 1;
        if (o1.username < o2.username)
            return -1;
        return 1;
    }
    else {
        if (o1.online_status && !o2.online_status)
            return -1;
        if (!o1.online_status && o2.online_status)
            return 1;
        if (o1.username < o2.username)
            return -1;
        return 1;
    }
};

UserSchema.statics.getFullUserList = function () {
    return User.find().then(users => {
        users = users.sort(sort_user_func);
        users = users.map(u => u.toJSON());
        return Promise.resolve(users);
    });
};

UserSchema.statics.getVisibleUserList = function () {
    return User.find({account_status: CUser.ACCOUNT_STATUS_ACTIVE}).then(users => {
        users = users.sort(sort_user_func);
        users = users.map(u => u.toJSON());
        return Promise.resolve(users);
    });
};

UserSchema.methods.ifUser = function () {
    let user = this;
    return user.privilege === CUser.PRIVILEGE_USER;
};

UserSchema.statics.findByToken = function (token) {
    // first ensure token is valid
    try {
        jwt.verify(token, process.env.SALT);
    } catch (e) {
        return Promise.reject('Token is invalid');
    }
    return User.findOne({token});
};

UserSchema.statics.check = function (username, password) {
    let user = new User({username, password});
    let error = user.validateSync();
    if (error) {
        return Promise.reject(error);
    }

    return User.findOne({username}).then((user) => {
        if (!user) return Promise.reject({
            status: 201,
            message: 'Do not have user'
        });

        if (user.account_status === CUser.ACCOUNT_STATUS_INACTIVE){
            return Promise.reject({
                status: 401,
                message: 'Currently Your account is INACTIVE'
            });
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                res === true ? resolve(user) : reject({
                    status: 401,
                    message: 'Password is not correct'
                });
            });
        });
    });
};

UserSchema.statics.countNumber = function (username) {
    let qs = new RegExp(username, "i");
    return User.find({username: qs}).count();
};

UserSchema.statics.findByUsername = function (username_list, skip_number, limit_number) {
    let query = [];
    for (let i = 0; i < username_list.length; i++) {
        let qs = new RegExp(username_list[i], 'i');
        query[i] = {'username': qs};
    }

    console.log('skip number here is:' + skip_number);
    console.log('limit number here is:' + limit_number);
    return User.find({'$or': query}).limit(limit_number)
        .skip(skip_number)
        .then(users => users.sort(sort_user_func));
};

UserSchema.statics.findOneByUsername = function (username) {
    return User.findOne({username})
        .then(user => {
            return new Promise((resolve, reject) => {
                if (user) {
                    resolve(user);
                } else {
                    reject({status: 401, message: 'No user found'});
                }
            });
        });
};

UserSchema.statics.findByStatus = function (status, skip_number, limit_number) {
    //let qs = new RegExp(status, 'g');
    return User.find({user_status: status})
        .limit(limit_number)
        .skip(skip_number)
        .then(users => users.sort(sort_user_func));
};

UserSchema.statics.hash = function (password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject();
            resolve(hash);
        });
    });
};

UserSchema.statics.Create = function (user) {
    let error = new User(user).validateSync(); //Validation
    if (error) {
        return Promise.reject(error);
    }

    return User.hash(user.password).then((hash) => {
        let newUser = new User({
            username: user.username,
            password: hash,
            user_status: user.user_status ? user.user_status : CUser.USER_STATUS_UNDEFINED,
            privilege: user.privilege ? user.privilege : CUser.PRIVILEGE_USER,
            status_timestamp: moment().valueOf()
        });

        let id = new ObjectID();
        newUser._id = user._id || id;
        return Promise.resolve(newUser);
    });
};

UserSchema.statics.UpdateAllowWarn = function (username, isAllowed) {
    return User.findOne({username: username}, (err, doc) => {
        doc.allowWarn = isAllowed;
        doc.save();
    });
};

UserSchema.statics.getAllowWarnList = function (lat, lng) {
    return User.find({allowWarn: true}).then((userList) => {
        let retUserList = new Array();
        let index = 0;
        for (let i = 0; i < userList.length; i++) {
            let user = userList[i];
            let distance = dis.getFlatternDistance(parseFloat(lat), parseFloat(lng), parseFloat(user.latitude), parseFloat(user.longitude));
            console.log('distance between:' + user.username + 'is:' + distance);
            if (distance < 100) {
                retUserList[index] = user;
                index++;
            }
        }
        return retUserList;
    });
};

const User = mongoose.model('User', UserSchema);

let username = process.env.username;
let password = process.env.password;

User.findOne({username})
    .then(user => {
        if (!user) {
            user = {
                username: username,
                password: password,
                user_status: CUser.USER_STATUS_OK,
                privilege: CUser.PRIVILEGE_ADMIN,
            };
            return User.Create(user);
        } else
            return Promise.resolve(user);
    })
    .then(user => user.save())
    .catch(err => console.log(err));

module.exports = User;
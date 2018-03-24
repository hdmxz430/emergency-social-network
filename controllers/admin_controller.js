const _ = require('lodash');
const {defaultErr} = require('./utils');
const User = require('../models/user');
const {CUser} = require('../models/const');

let AdminPage = (req, res) => {
    console.log("Here In AdminPage");
    res.render('admin_control', {title: 'Administration'});
};

let getUsers = (req, res) => {
    User.getFullUserList()
        .then(users => {
            const io = require('../app').io;
            io.emit('update_admin_users', {users});
            res.send({users});
        })
        .catch(err => defaultErr(err, res));
};

let getSpecificUser = (req, res) => {
    User.findById(req.query.user_id).then((user_) => {
        res.status(200).send({user: user_});
    })
};

let SpecificUserPage = (req, res) => {
    User.findById(req.query.user_id).then((user) => {
        res.render('admin_profile', {user: user});
    });
};

let updateUser_helper = (user, data, num) => {
    return new Promise((resolve, reject) => {
        if (num == 1) {
            user.username = data.new_username;
            resolve(user);
        }
        else if (num == 2) {
            User.hash(data.new_password).then((hash) => {
                user.password = hash;
                resolve(user);
            });
        }
        else if (num == 3) {
            user.account_status = data.new_account_status;
            if (user.account_status === CUser.ACCOUNT_STATUS_INACTIVE) user.online_status = 0;
            resolve(user);
        }
        else if (num == 4) {
            user.privilege = data.new_privilege;
            resolve(user);
        }
        else {
            reject("invalid action num");
        }
    });
};

let updateUser = (req, res) => {
    let current_data = _.pick(req.body, ['user_id', 'action_num']);
    User.findById(current_data.user_id).then((user) => {
        updateUser_helper(user, req.body, current_data.action_num).then((user) => {
            let error = user.validateSync();
            if (error) {
                defaultErr(error, res);
            }
            else {
                user.save()
                    .then((user) => {
                        const io = require('../app').io;
                        if ((current_data.action_num == 3) && (user.account_status === CUser.ACCOUNT_STATUS_INACTIVE)) {
                            console.log("User: " + user.username + " Inactive");
                            io.emit("notify_account_info" + user.username, {user: user, info_type: 0, msg: "Account Inactive Now"});
                        }
                        else if (current_data.action_num == 4) {
                            let privilegeString = {1: 'Citizen', 2: 'Coordinator', 3: 'Administrator'};
                            io.emit("notify_account_info" + user.username, {user: user.toJSON(), info_type: 1, msg: "Privilege Level Adjusted to " + privilegeString[user.privilege]
                            });
                        }
                        else if ((current_data.action_num == 1) || (current_data.action_num == 2)) {
                            let msg = current_data.action_num == 1 ? "UserName has been changed" : "PassWord has been changed" ;
                            io.emit("notify_account_info" + user.username, {info_type: 2, msg: msg});
                        }
                        res.status(200).send({message: 'User updated successfully!'});
                    }).catch(err => defaultErr(err, res));
            }
        }).catch((err) => {
            res.status(402).send({message: err});
        });
    }).catch(err => defaultErr(err, res));
};



module.exports = {AdminPage, getUsers, SpecificUserPage, getSpecificUser, updateUser};

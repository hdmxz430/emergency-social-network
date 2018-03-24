const User = require('../models/user');
const {CUser} = require('../models/const');

let defaultErr = (e, res) => {
    console.log(e)
    if (e.hasOwnProperty('errors')) {
        let messages = {};
        for (let m in e.errors) {
            messages[m] = e.errors[m].message;
        }
        res.status(400).send(messages);
    } else {
        // if error has specified status, use it.
        let status = 500; //In Case no Specified status in 'e'
        if (e.hasOwnProperty('status'))
            status = e.status;
        res.status(status).send(e);
    }
};

// user, coordinator, admin can pass
let authUser = (req, res, next) => {
    auth(req, res, next, user => {
        return user.privilege >= CUser.PRIVILEGE_USER;
    })
};

// coordinator, administrator can pass
let authCoordinator = (req, res, next) => {
    auth(req, res, next, user => {
        return user.privilege >= CUser.PRIVILEGE_COORDINATOR;
    })
};

// Only administrator can pass
let authAdmin = (req, res, next) => {
    auth(req, res, next, user => {
        console.log("Current User's Privilege Level is: "+user.privilege);
        return user.privilege === CUser.PRIVILEGE_ADMIN;
    })
};

let checkToken = (req) => {
    let token = null;
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE'){
        token = req.body.token;
    }else if (req.method === 'GET'){ //Handle Query Request
        token = req.query.token;
    }
    return token;
};

let auth = (req, res, next, canContinueCallback) => {
    let token = checkToken(req);
    if (!token){
        return res.status(401).send({message: 'You do not have permission'});
    }
    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        if (user.account_status === CUser.ACCOUNT_STATUS_INACTIVE){
            return Promise.reject();
        }

        if (!canContinueCallback(user)){
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    }).catch(() => {
        res.status(401).send({message: 'You do not have permission'});
    });
};

module.exports = {defaultErr,authAdmin, authCoordinator, authUser};
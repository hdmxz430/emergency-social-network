const reservedUserName = require('./reservedName');
const {CUser} = require('./const');
const mongoose = require('mongoose');

let UsernameSchema = {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 3,
    validate: {
        validator(v) {
            return !reservedUserName.has(v);
        },
        message: '{VALUE} is not a valid username'
    },
};

let UserstatusSchema = {
    required: true,
    type: Number,
    default: 0,
    validate: {
        validator(v) {
            return !(v !== 0 && v !== 1 && v !== 2 && v !== 3);
        },
        message: 'Emergency Status should be: 0-Undefined 1-OK 2-Help 3-Emergency'
    },
};

let PrivilegeSchema = {
    // 1: user, 2: coordinator, 3: administrator
    required: true,
    type: Number,
    default: CUser.PRIVILEGE_USER,
    validate: {
        validator(v) {
            return !(v !== 1 && v !== 2 && v !== 3);
        },
        message: 'Privilege should be: 1-user 2-coordinator 3-administrator'
    }
};

let OnlineStatusSchema = {
    // 0: offline, 1: online
    type: Number,
    default: CUser.STATUS_OFFLINE,
    validate: {
        validator(v) {
            return !(v !== 0 && v !== 1);
        },
        message: 'online status should be: 0-offline 1-online'
    }
};

let AccountStatusSchema = {
    // 0: inactive, 1: active
    type: Number,
    default: CUser.ACCOUNT_STATUS_ACTIVE,
    validate: {
        validator(v) {
            return !(v !== 0 && v !== 1);
        },
        message: 'account status should be: 0-inactive 1-active'
    }
};

let UserSchema = new mongoose.Schema({
    username: UsernameSchema,
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 4
    },
    token: {
        type: String,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    allowWarn: {
        type: Boolean,
        default: true
    },
    status_timestamp: {
        type: Number,
    },
    user_status: UserstatusSchema,
    privilege: PrivilegeSchema,
    online_status: OnlineStatusSchema,
    account_status: AccountStatusSchema
});


UserSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.token;
        delete ret.__v;
    },

});

module.exports = UserSchema;
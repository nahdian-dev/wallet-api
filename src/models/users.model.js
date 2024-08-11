const mongoose = require('mongoose');
const crypto = require('crypto');

const usersModel = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
},
    {
        timestamps: true,
    }
);

usersModel.methods.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(6).toString('base64').replace(/[^a-zA-Z]/g, '').substring(0, 6);
    this.resetPasswordExpires = Date.now() + 3600000;
};

module.exports = mongoose.model('Users', usersModel);
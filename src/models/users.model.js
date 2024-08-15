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
    reset_password_token: {
        type: String,
    },
    reset_password_expires: {
        type: Date,
    },
    is_verified: {
        type: Number,
        required: true,
    },
    token_verify_email: {
        type: String,
    },
    expired_token_verify_email: {
        type: Date,
    }
},
    {
        timestamps: true,
    }
);

usersModel.methods.generatePasswordReset = function () {
    this.resetPasswordToken = crypto.randomBytes(4).readUInt32BE(0) % 1000000;
    this.resetPasswordExpires = Date.now() + 3600000;
};

usersModel.methods.generateTokenVerifyEmail = function () {
    const part1 = crypto.randomBytes(6).toString('hex'); // 6 bytes = 12 hex characters
    const part2 = crypto.randomBytes(6).toString('hex');
    const part3 = crypto.randomBytes(6).toString('hex');

    this.token_verify_email = `${part1}-${part2}-${part3}`;
    this.expired_token_verify_email = Date.now() + 3600000;
};

module.exports = mongoose.model('Users', usersModel);
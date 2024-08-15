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

module.exports = mongoose.model('Users', usersModel);
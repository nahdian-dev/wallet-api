const mongoose = require('mongoose');

const accountModel = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    account_name: {
        type: String,
        required: true,
    },
    bank_account_number: {
        type: String,
        required: true,
        unique: true,
    },
    initial_value: {
        type: Number,
        required: true,
    }
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Account', accountModel);
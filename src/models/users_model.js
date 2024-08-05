const mongoose = require('mongoose')

const usersModel = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username harus di isi!']
    },
    email: {
        type: String,
        required: [true, 'Email harus di isi!'],
        unique: [true, 'Username telah tersedia!']
    },
    password: {
        type: String,
        required: [true, 'Password harus di isi!']
    }
},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Users', usersModel)
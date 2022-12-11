const mongoose = require('mongoose');

const User = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        fullName: { type: String, require: true },
        gender: {type: String },
        avatar: { type: String },
    }
);

module.exports = mongoose.model('User', User);

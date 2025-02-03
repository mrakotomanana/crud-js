const db = require('../database/dbUser');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String},
    password: { type: String },
    email: { type: String},
    createdAt: { type: Date, default: Date.now }
});

const User = db.model('User', userSchema);

module.exports = User;

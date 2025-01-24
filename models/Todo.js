const db = require('../database/db');
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  checked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = db.model('Todo', TodoSchema);

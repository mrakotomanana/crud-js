const db = require('../database/db');
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

module.exports = db.model('Todo', TodoSchema);

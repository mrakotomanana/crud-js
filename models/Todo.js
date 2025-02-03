const db = require('../database/db');
const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  text: { type: String },
  username: { type: String},
  dueDate: { type: Date, required: false }, 
  checked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = db.model('Todo', TodoSchema);

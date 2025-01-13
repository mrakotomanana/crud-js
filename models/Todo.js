const mongoose = require('../database/db');

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

module.exports = mongoose.model('Todo', TodoSchema);

const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/todos');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
  console.log('Connecté à MongoDB');
});

module.exports = mongoose;
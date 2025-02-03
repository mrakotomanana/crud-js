const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/todos');
// mongoose.connect('mongodb+srv://rakotomanan:xGv5HtU0cok1IFQU@cluster0.wetth.mongodb.net/todos?retryWrites=true&w=majority');

// const db = mongoose.connection;
//const db = mongoose.createConnection('mongodb+srv://rakotomanan:xGv5HtU0cok1IFQU@cluster0.wetth.mongodb.net/todos?retryWrites=true&w=majority', {
const db = mongoose.createConnection('mongodb://127.0.0.1:27017/todos', {});

db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
  console.log('Connecté à MongoDB Todo');
});


module.exports = db;
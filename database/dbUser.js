const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/users');
// mongoose.connect('mongodb+srv://rakotomanan:xGv5HtU0cok1IFQU@cluster0.wetth.mongodb.net/users?retryWrites=true&w=majority');

// const db = mongoose.connection;
const db = mongoose.createConnection('mongodb://localhost:27017/users', {
});

console.log('Connecté à MongoDB User');
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB User :'));
db.once('open', () => {
  console.log('Connecté à MongoDB User');
});

module.exports = db;

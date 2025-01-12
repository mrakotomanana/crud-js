require('dotenv').config();
const { render } = require('ejs');
const express = require('express');
const path = require('path');
const { title } = require('process');

const app = express();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'Production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.locals.title = 'To Do List';
    next(); 
});

app.get('/', (req, res) => {
    res.render('index', {title: 'Accueil ToDo'});
});

app.get('/add', (req, res) => {
    res.render('pages/add', {title: 'Ajouter des ToDo'});
});


app.listen(PORT, () => {
    console.log(`Server on http::/localhost:${PORT} en mode ${ENV}`);
});
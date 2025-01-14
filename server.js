require('dotenv').config();
const { render } = require('ejs');
const express = require('express');
const Todo = require('./models/Todo');
const path = require('path');

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.locals.title = 'To Do List';    
    res.locals.css = 'main';
    res.locals.currentUrl = req.url; 
    next(); 
});

app.get('/', (req, res) => {
    res.render('index', {title: 'Accueil ToDo'});
});

app.get('/add', (req, res) => {
    res.render('pages/add', {title: 'Ajouter des ToDo', css: 'add'});
});

app.get('/list', async (req, res) => {
    const todos = await Todo.find();
    res.render('pages/list', {title: 'View ToDo', css: 'list', todos});
});

app.put('/api/todos/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { text, checked } = req.body;
  
      const updatedTodo = await Todo.findByIdAndUpdate(
        id,
        { text, checked },
        { new: true }
      );
  
      if (!updatedTodo) {
        return res.status(404).send({ message: 'ToDo introuvable.' });
      }
  
      res.status(200).send(updatedTodo);
    } catch (error) {
      res.status(500).send({ message: 'Erreur lors de la modification du ToDo.' });
    }
  });


app.post('/api/todos', async (req, res) => {
    const { text } = req.body;
  
    if (!text) {
      return res.status(400).json({ message: 'Le texte est requis' });
    }
  
    try {
      const newTodo = new Todo({ text });
      await newTodo.save();
      res.status(201).json(newTodo);
    } catch (err) {
      res.status(500).json({ message: 'Erreur interne' });
    }
  });

app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const deletedTodo = await Todo.findByIdAndDelete(id);
  
      if (!deletedTodo) {
        return res.status(404).json({ message: 'Tâche introuvable.' });
      }
  
      res.status(204).json({ message: 'Tâche bien supprimée.' });
    } catch (err) {
      res.status(500).json({ message: 'Erreur interne.' });
    }
  });


app.listen(PORT, () => {
    console.log(`Server on ${PORT} en mode ${ENV}`);
});
require('dotenv').config();
const { render } = require('ejs');
const express = require('express');
const Todo = require('./models/Todo');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
// const maskdata = require('maskdata');
// const rateLimit = require('express-rate-limit');
const User = require('./models/User');

const app = express();

const dataSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'); 

// const limiter = rateLimit({
// 	windowMs: 60 * 1000, // 15 * 60 * 1000, // 15 minutes
// 	limit: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
// 	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
// 	// store: ... , // Redis, Memcached, etc. See below.
//     message: 'Too many requests, please try again later.',
// })

// const logger = function(req, res, next) {
// 	const { method, url } = req;
// 	const date = new Date().toLocaleString();
// 	console.log(`${date}: ${method} ${url}`);
// 	next();
// }

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
      return next();
  } else {
      return res.redirect('/login');
  }
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan('common'));
// app.use(logger);

// app.use(helmet());
app.use(
  helmet({
      contentSecurityPolicy: false, // Désactiver uniquement la CSP nonce
  })
);

// app.use(limiter);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.use(session({
  secret: dataSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.title = 'To Do List';    
    res.locals.css = 'main';
    res.locals.currentUrl = req.url; 
    res.locals.error = null; 
    res.locals.isAuthenticated = req.session && req.session.user;
    res.locals.user = req.session ? req.session.user : null; 
    // res.locals.nonce = crypto.randomBytes(16).toString('base64'); // Génère un nonce aléatoire
    // res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${res.locals.nonce}'`);
    next();
});

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {title: 'Accueil'});
});

app.get('/login', (req, res) => {
  if (req.session.user) {
      return res.redirect('/');
      
  }
  res.render('pages/login');

});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("123");
    
   
    console.log("456");
    let user = await User.findOne({ username });
    console.log("789");

      if (!user) {
          const hashedPassword = await bcrypt.hash(password, 10);
          user = new User({ username, password: hashedPassword });
          await user.save();
          console.log('Nouvel utilisateur enregistré :', username);
      } else {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              return res.render('pages/login', { error: 'Mot de passe incorrect' });
          }
      }

      req.session.user = { id: user._id, username: user.username };
      return res.redirect('/'); 

  } catch (err) {
      console.error('Erreur lors de la connexion/inscription :', err);
      res.render('pages/login', { error: 'Une erreur est survenue. Veuillez réessayer.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          console.error(err);
      }
      res.redirect('/login');
  });
});


app.get('/add', isAuthenticated, (req, res) => {
    res.render('pages/add', {title: 'Ajouter une tâche', css: 'add'});
});

app.get('/list', isAuthenticated, async (req, res) => {
    const todos = await Todo.find();
    res.render('pages/list', {title: 'Liste des Tâches', css: 'list', todos});
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
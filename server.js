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
const PDFDocument = require('pdfkit');
const { body, validationResult } = require('express-validator');

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
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('dev'));
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
// app.set('view options', { async: true });

const PORT = process.env.PORT || 8000;
const ENV = process.env.NODE_ENV || 'development';

app.use(session({
  secret: dataSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
  res.locals.title = 'Tâche';
  res.locals.css = 'main';
  res.locals.currentUrl = req.url;
  res.locals.error = null;
  res.locals.isConnected = false;
  res.locals.isAuthenticated = req.session && req.session.user;
  res.locals.user = req.session ? req.session.user : null;
  // res.locals.nonce = crypto.randomBytes(16).toString('base64'); // Génère un nonce aléatoire
  // res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${res.locals.nonce}'`);
  next();
});

const validationPass = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!regex.test(password)) {
    throw new Error(
      'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial. ' + ' - ' + password
    );
  }
  return true;
};

app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { title: 'Accueil' });
});

app.get('/login', (req, res) => {
  if (req.session.user && req.session.isConnected) {
    return res.redirect('/');
  }
  res.locals.currentUrl = "/";
  res.render('pages/login');
});

app.get('/register', (req, res) => {
  res.locals.currentUrl = "/";
  res.render('pages/register');
});

app.post('/register', [
  body('password').custom((password) => validationPass(password)),
  body('username')
    .isLength({ max: 20 })
    .withMessage('Le nom d\'utilisateur ne doit pas dépasser 20 caractères.'),
  body('email')
    .isEmail()
    .withMessage('Veuillez entrer une adresse email valide.')
], async (req, res) => {

  const { username, password, email, passconfirm } = req.body;
  let isNotConfirm = passconfirm != password;
  if (isNotConfirm) {
    req.session.isConnected = false;
    return res.render('pages/register', { error: 'Mot de passe non confirmé.' });
  }
  try {
    let user = await User.findOne({ username });
    if (user) {
      let isMatch = username === user.username;
      if (isMatch) {
        req.session.isConnected = false;
        return res.render('pages/register', { error: 'Utilisateur déjà utilisé.' });
      }

      isMatch = email === user.email;
      if (isMatch) {
        req.session.isConnected = false;
        return res.render('pages/register', { error: 'Email déjà utilisé.' });
      }
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.isConnected = false;
      const errorMessages = errors.array().map((error) => error.msg);
      return res.render('pages/register', { error: errorMessages });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, password: hashedPassword, email });
    await user.save();
    console.log('Nouvel utilisateur enregistré :', username);
    req.session.user = { id: user._id, username: user.username };
    req.session.isConnected = true;
    return res.redirect('/');
  } catch (error) {
    console.error('Erreur lors de la connexion :', err);
    req.session.isConnected = false;
    res.render('pages/register', { error: 'Une erreur est survenue. Veuillez réessayer.' });
  }

});



app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log(req.body);
  
  try {
    let user = await User.findOne({ username });
    if (user) {
      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        req.session.isConnected = false;
        return res.render('pages/login', { error: 'Mot de passe incorrect' });
      }
      isMatch = username === user.username;
      if (!isMatch) {
        req.session.isConnected = false;
        return res.render('pages/login', { error: 'Utilisateur incorrect' });
      }
      req.session.user = { id: user._id, username: user.username };
      req.session.isConnected = true;
      return res.redirect('/');
    } else {
      console.error('Erreur lors de la connexion :', user);
      res.render('pages/login', { error: 'Cet utilisateur est instrouvable. Veuillez s\'inscrire.' });
    }
  } catch (err) {
    console.error('Erreur lors de la connexion :', err.message);
    req.session.isConnected = false;
    res.render('pages/login', { error: 'Cet utilisateur est instrouvable. Veuillez s\'inscrire.' });
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


app.get('/add', isAuthenticated, async (req, res) => {
  const todos = await Todo.find({ username: req.session.user.username, password: req.session.user.password });
  res.render('pages/add', { title: 'Ajouter une tâche', css: 'add', todos });
});

app.get('/list', isAuthenticated, async (req, res) => {
  
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  try {
    const todos = await Todo.find({ username: req.session.user.username, password: req.session.user.password }).sort({createdAt: -1 }).skip(skip).limit(5);
    const totalTodos = await Todo.countDocuments({ 
      username: req.session.user.username, 
      password: req.session.user.password 
    });
    const totalPages = Math.ceil(totalTodos / limit);
    res.render('pages/list', { title: 'Liste des Tâches', css: 'list', todos, currentPage: page, totalPages });
  } catch (error) {
    console.error(err);
    res.status(500).send("Une erreur s'est produite.");
  }
});

app.get('/print', isAuthenticated, async (req, res) => {
  const todos = await Todo.find({ username: req.session.user.username }).sort({ createdAt: -1 });
  res.render('pages/print', { title: 'Imprimer les tâches', css: 'print', todos });
});

app.get('/download/pdf', isAuthenticated, async (req, res) => {
  try {
      const todos = await Todo.find({ username: req.session.user.username });
      const doc = new PDFDocument({ margin: 50 });
      const filename = `taches_${new Date().toLocaleDateString()}.pdf`;

      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');

      doc.pipe(res);

      doc.fontSize(20).text(`Liste des tâches de ${req.session.user.username}`, { align: 'center' });
      doc.moveDown();

      const maxItemsPerPage = 10;
      let itemCount = 0;
  
      todos.forEach((todo, index) => {
          if (itemCount >= maxItemsPerPage) {
              doc.addPage();
              doc.fontSize(20).text('Liste des tâches (suite)', { align: 'center' });
              doc.moveDown();
              itemCount = 0;
          }
         
          doc.fillColor('#007bff').fontSize(14).text(`Tâche : ${todo.text}`);
          doc.fillColor('black').fontSize(12).text(`Estimation : ${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'Pas de date'}`);
          doc.fillColor('black').fontSize(12).text(`Terminé : ${todo.checked ? 'Oui' : 'Non'}`);
          doc.moveDown();         
          
          itemCount++;
      });
      doc.end();
  } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      res.status(500).send('Erreur serveur');
  }
});

app.get('/search', isAuthenticated, async (req, res) => {
  res.locals.currentUrl = "/";
  res.render('pages/search', { title: 'Recherche de Tâches', css: 'search'});
});

app.get('/api/todos', isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const todos = await Todo.find({ username: req.session.user.username })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTodos = await Todo.countDocuments({ username: req.session.user.username });
    const totalPages = Math.ceil(totalTodos / limit);

    res.json({ todos, totalPages, currentPage: page });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches.' });
  }
});

app.get('/api/search', isAuthenticated, async (req, res) => {
  try {
    const query = req.query.q?.trim();
    console.log(query);
    
    if (!query) {
      return res.status(400).json({ error: 'Veuillez entrer un terme de recherche.' });
    }

    // Recherche insensible à la casse dans les tâches de l'utilisateur connecté
    const todos = await Todo.find({
      username: req.session.user.username,
      text: { $regex: query, $options: 'i' } // Regex pour recherche partielle et insensible à la casse
    });

    res.json({ todos });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la recherche.' });
  }
});





app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, dueDate, checked } = req.body;
    let username = req.session.user.username;

    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { text, username, dueDate, checked },
      { new: true }

    );

    if (!updatedTodo) {
      return res.status(404).send({ message: 'Tâche introuvable.' });
    }

    res.status(200).send(updatedTodo);
  } catch (error) {
    res.status(500).send({ message: 'Erreur lors de la modification d\'une Tâche.' });
  }
});


app.post('/api/todos', isAuthenticated, 
  [
    body('text')
      .trim()
      .escape()
      .isLength({ max: 50 })
      .withMessage('Le texte ne doit pas dépasser 50 caractères.')
      .notEmpty()
      .withMessage('Le texte ne peut pas être vide.'),
      body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('La date de fin doit être une date valide (ISO 8601).')
      .custom((value) => {
        const dueDate = new Date(value);
        const today = new Date(); 
        today.setHours(0, 0, 0, 0);
  
        if (dueDate < today) {
          throw new Error('La date de fin doit être supérieure ou égale à aujourd\'hui.');
        }
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let msg = errors.array().map((error) => error.msg);
      res.locals.error = msg;
      return res.status(400).json({ message: msg });
    }

    const { text, dueDate } = req.body;
    const username = req.session.user.username;

    if (!text) {
      return res.status(400).json({ message: 'Le texte est requis' });
    }

    try {      
      let finalDueDate = dueDate ? new Date(dueDate).toISOString() : Date.now;
      const newTodo = new Todo({ text, username, dueDate: finalDueDate });
      console.info(newTodo)
      await newTodo.save();
      res.status(201).json(newTodo);
    } catch (err) {
      console.error('Erreur serveur :', err);
      res.status(500).json({ message: 'Erreur interne' });
    }
  });

app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  let username = req.session.user.username;

  try {
    const deletedTodo = await Todo.findOne({ _id: id, username: username });

    if (!deletedTodo) {
      return res.status(404).json({ message: 'Tâche non trouvée ou utilisateur non autorisé.' });
    }
    await Todo.deleteOne({ _id: deletedTodo._id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Erreur interne.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server on ${PORT} en mode ${ENV}`);
});
//express
const express = require('express');
var app = express();

//modules
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const urls = require('url');

//my modules
const forMongoose = require("./mongoose/mong");
const add_joke = require('./mongoose/add_joke');

//connect to mongodb
var url = 'mongodb+srv://popularjokes:popularjokes12@cluster0.fe0no.mongodb.net/forum?retryWrites=true&w=majority';
mongoose.connect(url);

//set engine view
app.set('view engine', 'ejs');

//views external fieles
app.use(express.static(__dirname + '/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//session  store
var sessionCreator = MongoStore.create({
  mongoUrl: url,
  collection: "sessions"
});

app.use(session({
  secret: 'Hellowordsecret',
  resave: false,
  saveUninitialized: true,
  store: sessionCreator,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
  }
}))

//passport
require('./passports/passports');

app.use(passport.initialize());
app.use(passport.session());

var isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
      next();
  } else {
      res.redirect('/login?op=no_account');
  }
}

app.use((req, res, next)=>{
  console.log('yes');
  next();
})

//landing_page
app.get('/', (req, res)=>{
  res.render('index', { name: req.user });
});

//login
app.get('/login', (req, res)=>{
  var q = urls.parse(req.url, true).query;
  if(q.op == 'succes_register') {
    res.render('login', { message_display: 'You have successfully registered' })
  }else if(q.op == 'no_account') {
    res.render('login', { message_display: 'You need to log in' })
  } else {
    res.render('login', { message_display: null })
  }
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/' }));

//register
app.get('/register', (req, res)=>{
  var q = urls.parse(req.url, true).query;
  if(q.op == 'username_exists') {
    res.render('register', { message_display: 'The username is taken by someone else' })
  } else {
    res.render('register', { message_display: null })
  }
});

app.post('/register', async (req, res)=>{
  //get result
  const record = req.body;
  //check if user exist in db
  var checkPromise = checkIfExists(record.username);

  checkPromise.then(async function(result) {
    if(result === 1) {
      res.redirect('/register?op=username_exists');
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      record.password = hashedPassword; // update hashedPassword to record;
      var insertIn = await forMongoose.create(record);
      
      res.redirect('/login?op=succes_register');
    }
  })
});

//jokes page
app.get('/jokes', async (req, res)=>{
  var records = await add_joke.find({});
  res.render('jokes', { name: req.user, recs: records });
});

//my jokes
app.get('/my_jokes', isAuth, async (req, res)=>{
  var records = await add_joke.find({post_user: req.user.username});
  res.render('my_jokes', { recs: records });
});

//create joke
app.get('/create_joke', isAuth, (req, res)=>{
  res.render('create_joke', { name: req.user });
});

app.post('/create_joke', async (req, res)=>{
  var records = req.body;
  var addTo = await add_joke.create(records);

  res.redirect('/');
});

//log out
app.get('/logout', isAuth, (req, res, next) => {
  req.logout();
  res.redirect('/');
});


app.get('/protected-route', isAuth, (req, res, next) => {
  res.send('You made it to the route.');
});

//function for check username
var checkIfExists = async (username) => {
  var result = await forMongoose.find({ username: username});
  if(result.length >= 1) { return 1; }
}

app.listen(8000, ()=>{ console.log('Server up on port 8000'); });

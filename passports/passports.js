//modules
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

//my modules
const User = require("../mongoose/mong");

//connect to mongodb
var url = 'mongodb+srv://popularjokes:popularjokes12@cluster0.fe0no.mongodb.net/forum?retryWrites=true&w=majority';
mongoose.connect(url);

var check = (username, password, done) => {
    User.findOne({username: username})
    .then(async (user)=>{
        if(!user) { return done(null, false); }

        var results = await bcrypt.compare(password, user.password);
        
        if(results) {
            return done(null, user);
        } else {
            return done(null, false);
        }

    });
}

var strategy = new LocalStrategy(check);

passport.use(strategy);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((userId, done) => {
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))
});
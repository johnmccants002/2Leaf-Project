const passport = require('passport');
const User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
var sendgrid = require('@sendgrid/mail');
// var db = require('../config/database');



sendgrid.setApiKey(process.env['SENDGRID_API_KEY']);



// passport.serializeUser(function(user, cb) {
//   process.nextTick(function() {
//     cb(null, { id: user.id, email: user.email });
//   });
// });

// passport.deserializeUser(function(user, cb) {
//   process.nextTick(function() {
//     return cb(null, user);
//   });
// });
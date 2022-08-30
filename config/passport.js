const passport = require('passport');
const User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var sendgrid = require('@sendgrid/mail');
sendgrid.setApiKey(process.env['SENDGRID_API_KEY']);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



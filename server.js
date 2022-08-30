var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var LocalStrategy = require('passport-local').Strategy;


require('dotenv').config();
// config/database depends upon process.env.DATABASE_URL
require('./config/database');
require('./config/passport');



// require routes
var indexRouter = require('./routes/index');



// create the express app
var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')


// middleware
app.use(logger('dev'))
// app.use(express.json())
// app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(cookieParser());
app.use(methodOverride('_method'))



// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
)


// passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});


// router middleware
app.use('/', indexRouter)
// app.use('/auth', authRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', {
    title: `🎊 ${err.status || 500} Error`,
  })
})

module.exports = app;
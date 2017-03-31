var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
//var flash = require('connect-flash');

var passport = require('passport');
var userController = require('./controllers/user');
var authController = require('./controllers/auth');

// Database
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/nodeJs-test');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// Passport init
app.use(passport.initialize());

/*
// Connect Flash
app.use(flash());

// Global Vars

app.use(function (req, res, next){
  //res.locals.success_msg = req.flash('success_msg');
  //res.locals.error_msg = req.flash('error_msg');
  //res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});
*/ 

// Create our Express router
var router = express.Router();

// Create endpoint handlers for /register
router.route('/register')
	.get(userController.getRegister)
	.post(userController.registerUser);

// Create endpoint handlers for /login
router.route('/login')
	.get(userController.getLogin)
	.post(userController.loginUser);

// Create endpoint handlers for /logout
router.route('/logout')
	.get(userController.getLogout);

// Create endpoint handlers for /profile
router.route('/profile')
	.get(authController.isBearerAuthenticated, userController.getProfile);

// Register all our routes with /api
app.use('/api', router);


var port = process.env.PORT || (process.argv[2] || 3000);
port = (typeof port === "number") ? port : 3000;
if(!module.parent){ app.listen(port); }
console.log("Application started. Listening on port:" + port)


module.exports = app;

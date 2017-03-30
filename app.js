var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');

var passport = require('passport');
var jwt = require('jsonwebtoken');
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('./models/user');

var secretString = "secretPassword";


// Database
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/nodeJs-test');
var db = mongoose.connection;

//var routes = require('./routes/index');
//var api = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//PASSPORT
passport.use(new BearerStrategy(
	function(token, next) {
	console.log('autentication starts token- '+ token);	
	User.findOne({token:token}, function(err, user){
			if (err) {
				console.log('err -' + err);
				return next(err);
			}
			if (!user) {
				return next(null, false);
			} 
			console.log('found user with token-' + user);
			return next (null, user);
			
	});
}));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Passport init
app.use(passport.initialize());

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

//app.use('/', routes);
//app.use('/api', api);

//var router = express.Router();

// Register
app.get('/api/register', function(req, res){
	res.render('register');
});

// Login
app.get('/api/login', function(req, res){
	res.render('login');
});

// Register User
app.post('/api/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;

	// Validation
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();

	req.getValidationResult().then(function(result){
		
		if(result.isEmpty()){
				var newUser = new User({
						name: name,
						email:email,
						password: password,
						token:''
				});

				User.createUser(newUser, function(err, user){
					if(err && (11000 === err.code || 11001 === err.code)) {
						res.sendStatus(400);
					}else{
						res.status(201).json({token: {id: user.id}});
					}
				});
				return;
		}else{
			res.sendStatus(400);
		 	return;}
	});
	
});


app.post('/api/login', function(req, res, done) {
			User.findOne({email: req.body.email}, function(err, user){
					if(err) throw err;
					if(!user){
						return done(null, false, {message: 'Unknown User Email'});
					}
					User.comparePassword(req.body.password, user.password, function(err, isMatch){
						if(err) throw err;
						if(isMatch){
							var payload = {id: user.id};
							var token = jwt.sign(payload, secretString);
							User.findOneAndUpdate({email: user.email}, {$set:{token:token}}, {new: true}, function(err, user){
								if(err) throw err;
								if(!user){
									return done(null, false, {message: 'Unknown User Email'});
								}
								res.status(200).json({message: "ok", token: user.token});
						    });
					    } else {
							res.status(401).json({message:"passwords did not match"});
						}
					});
			});
			
	});
  

app.get('/api/logout', function(req, res){
	req.logout();
	//req.flash('success_msg', 'You are logged out');
	res.redirect('/api/login');
});


app.get('/api/profile', 
passport.authenticate('bearer', {session:false}), 
function(req, res) {
	console.log('req.user.email - ' + req.user.email);
	res.status(200).json({email: req.user.email});
});




var port = process.env.PORT || (process.argv[2] || 3000);
port = (typeof port === "number") ? port : 3000;
if(!module.parent){ app.listen(port); }
console.log("Application started. Listening on port:" + port)


module.exports = app;

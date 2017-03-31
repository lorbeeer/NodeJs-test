var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var User = require('../models/user');

passport.use(new BearerStrategy(
	function(token, next) {
	User.findOne({token:token}, function(err, user){
			if (err) {
				return next(err);
			}
			if (!user) {
				return next(null, false);
			} 
			next (null, user, { scope: '*' });
			
	});
}));

exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });

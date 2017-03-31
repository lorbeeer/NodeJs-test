var jwt = require('jsonwebtoken');
var User = require('../models/user');

var secretString = "secretPassword";

// Create endpoint /api/register user 
module.exports.getRegister = function(req, res){
	res.render('register');
};

module.exports.registerUser = function(req, res){
	var newUser = new User({
			name: req.body.name,
			email: req.body.email,
			password: req.body.password,
			token:''
	});

	newUser.save(function(err, user){
		if(err) return res.sendStatus(400);
			
		res.status(201).json({token: {id: user.id}});
    });
};

// Create endpoint /api/login user 
module.exports.getLogin = function(req, res){
	res.render('login');
};

module.exports.loginUser = function(req, res, done) {
    User.findOne({email: req.body.email}, function(err, user){
            if(err) return done(err);
            if(!user){
                return done(null, false, {message: 'Unknown User Email'});
            }
            user.comparePassword(req.body.password, user.password, function(err, isMatch){
                if(err) return done(err);
                if(isMatch){
                    var payload = {id: user.id};
                    var token = jwt.sign(payload, secretString);
                    User.findOneAndUpdate({email: user.email}, {$set:{token:token}}, {new: true}, function(err, user){
                        if(err) return done(err);
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
			
};

// Create endpoint /api/logout user 
module.exports.getLogout = function(req, res){
	req.logout();
	//req.flash('success_msg', 'You are logged out');
	res.redirect('/api/login');
};

// Create endpoint /api/profile 
module.exports.getProfile = function(req, res) {
	res.status(200).json({email: req.user.email});
};

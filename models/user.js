var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
mongoose.Promise = global.Promise;

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String, 
		required:true
	},
	email: {
		type: String, 
		required: true, 
		unique: true 
	},
	name: {
		type: String
	},
	token: {
		type: String
	}
});

UserSchema.pre('save', function(callback){
	var user = this;
	// Password  need to be hashed
	bcrypt.genSalt(10, function(err, salt) {
		if (err) return callback(err);

		bcrypt.hash(user.password, salt, function(err, hash) {
		if (err) return callback(err);
		user.password = hash;
		callback();
		});
	});
});

UserSchema.methods.comparePassword = function(candidatePassword, hash, cb){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
		if(err) return cb(err);
		cb(null, isMatch);	
	});
};

module.exports = mongoose.model('User', UserSchema);

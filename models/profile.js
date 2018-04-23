var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// Profile Schema
var ProfileSchema = mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	firstname: {
		type: String
	},
	middlename: {
		type: String
	},
	lastname: {
		type: String
	}
});

var Profile = module.exports = mongoose.model('Profile', ProfileSchema);

module.exports.createProfile = function(newProfile, callback){
	newProfile.save(callback);
}

module.exports.getProfileByUId = function(id, callback){
	var query = {user_id: id};
	Profile.findOne(query, callback);
}

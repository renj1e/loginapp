var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Global functions
var fns = require('../functions.js');

var User = require('../models/user');
var Profile = require('../models/profile');

// Register
router.get('/register', function(req, res){
	res.render('user/register');
});

// Login
router.get('/login', function(req, res){
	res.render('user/login');
});

// Dashboard
router.get('/session', fns.SAuth, function(req, res){
	res.render('user/dashboard');
});

// Profile
router.get('/profile', fns.SAuth, function(req, res){

	var id = res.locals.user._id;
	var getProfile = new Profile({
		user_id: id
	});

	Profile.find({"user_id": id}, function(err, profile){
	    if (profile.length < 1)
	    {
			var newProfile = new Profile({
				user_id: id,
				firstname: "First Name",
				middlename: "Middle Name",
				lastname: "Last Name"
			});

			Profile.createProfile(newProfile, function(err, profile){
				if(err) throw err;
			});
	    }
	   	else
	    {  
			var activeUser = new User({
				isActive: true,
	            _id:id // This is required, or a new ID will be assigned!
			});
	        User.findByIdAndUpdate(id, activeUser, {}, function (err, updateUser) {
	            if (err) { return next(err); }
	        });
	    }
		res.render('user/profile', {
			profile: profile
		});

	});
});

// Profile
router.get('/profile/update', fns.SAuth, function(req, res){

	var id = res.locals.user._id;
	var getProfile = new Profile({
		user_id: id
	});

	Profile.findOne({"user_id": id}, function(err, profile){
	    if (profile.length < 1)
	    {
			var newProfile = new Profile({
				user_id: id,
				firstname: "First Name",
				middlename: "Middle Name",
				lastname: "Last Name"
			});

			Profile.createProfile(newProfile, function(err, profile){
				if(err) throw err;
			});
	    }
	   	else
	    {  
			var activeUser = new User({
				isActive: true,
	            _id:id // This is required, or a new ID will be assigned!
			});
	        User.findByIdAndUpdate(id, activeUser, {}, function (err, updateUser) {
	            if (err) { return next(err); }
	        });
	    }

		res.render('user/profile-update', {
			profile: profile
		});
	});
});

router.post('/profile/post-update/:id', function(req, res){

	var id = req.params.id;
	console.log(req.body.schema === 'profile');
	if (req.body.schema === 'user')
	{
		var name = req.body.name;

		// Validation
		req.checkBody('name', 'Name is required').isLength({ min: 1 }).trim();

		var errors = req.validationErrors();
		if(errors){       
			res.render('user/profile-update', {
				errors:errors
			});
		} else {
			var updateUser = new User({
				name: name,
	            _id:id // This is required, or a new ID will be assigned!
			});

	        // Data from form is valid. Update the record.
	        User.findByIdAndUpdate(id, updateUser, {}, function (err, updateUser) {
	            if (err) { return next(err); }
	               // Successful - redirect to user detail page.
	               res.redirect('/u/profile');
	        });

			req.flash('success_msg', 'Successfully updated!');
		}
	}
	else
	{
		var uid = id;
		var firstname = req.body.firstname;
		var middlename = req.body.middlename;
		var lastname = req.body.lastname;

		// Validation
		req.checkBody('firstname', 'First Name is required').isLength({ min: 1 }).trim();
		req.checkBody('middlename', 'Middle Name is required').isLength({ min: 1 }).trim();
		req.checkBody('lastname', 'Last Name is required').isLength({ min: 1 }).trim();

		var errors = req.validationErrors();
		if(errors){       
			res.render('user/profile-update', {
				errors:errors
			});
		} else {
			var updateProfile = new Profile({
				firstname: firstname,
				middlename: middlename,
				lastname: lastname,
	            _id:id // This is required, or a new ID will be assigned!
			});

	        // Data from form is valid. Update the record.
	        Profile.findByIdAndUpdate(id, updateProfile, {}, function (err, updateProfile) {
	            if (err) { return next(err); }
	               // Successful - redirect to user detail page.
	               res.redirect('/u/profile');
	        });

			req.flash('success_msg', 'Successfully updated!');
		}
	}

});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required. (10 chars max)').isLength({ min: 1, max: 10 }).trim();;	
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('user/register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/u/login');
	}
});

passport.use(new LocalStrategy(
  	function(username, password, done) {
	User.getUserByUsername(username, function(err, user){
	   	if(err) throw err;
	   	if(!user){
	   		return done(null, false, {message: 'Unknown User'});
	   	}
	   	User.comparePassword(password, user.password, function(err, isMatch){
	   		if(err) throw err;
	   		if(isMatch){
	   			return done(null, user);
	   		} else {
	   			return done(null, false, {message: 'Invalid password'});
	   		}
	   	});
   	});
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/u/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/u/login');
});

module.exports = router;
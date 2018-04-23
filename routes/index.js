var express = require('express');
var router = express.Router();

// Global functions
var fns = require('../functions.js');

var User = require('../models/user');
var Profile = require('../models/profile');

// Get Homepage
router.get('/', function(req, res){
	res.render('site/index');
});

// Search Profile
router.get('/whois/:tagname', function(req, res){
	var tagname = req.params.tagname;
	if (tagname)
	{
		User.getUserByTagname(tagname, function(err, userProfile){
			console.log(userProfile);
			if (userProfile)
			{
				res.render('site/search-profile', {
					tagname: tagname,
					settings: "settings",
					profile: userProfile
				});
			}
			else
			{
				res.redirect('/');
			}

		});
	}
});

module.exports = router;
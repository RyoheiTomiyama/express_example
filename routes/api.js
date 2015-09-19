var mongoose = require('mongoose');

var Users = mongoose.model('User');

exports.users = function(req, res) {
	Users.find(function(err, items){
		return res.json(items);
    });
	// return res.json([{name:"tomi"},{name:"ryou"}]);
};

exports.createUser = function(req, res) {
    new Users({
        name: req.body.name,
        password: req.body.password
    }).save(function() {
    	console.log('save');
        res.end();
    });
};

exports.user = function(req, res) {
	Users.where({name: req.params.name}).findOne(function(err, item){
		if(err) return res.json(err);
		else return res.json(item);
		// return res.json(err);
	});
};

exports.deleteUser = function(req, res) {
	Users.remove({_id: req.params._id}, function(err){
		if(err) return;
		res.redirect('/');
	});
};
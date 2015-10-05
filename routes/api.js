var mongoose = require('mongoose');

var Users = mongoose.model('User');
var Profile = mongoose.model('Profile');

// USERS LIST
exports.users = function(req, res) {
	Users.find(function(err, items){
		return res.json(items);
    });
	// return res.json([{name:"tomi"},{name:"ryou"}]);
};
// CREATE NEW USER
exports.createUser = function(req, res) {
    new Users({
        name: req.body.name,
        password: req.body.password
    }).save(function() {
    	console.log('save');
        res.end();
    });
};
// SHOW USER
exports.user = function(req, res) {
	console.log(req.params.name);
	Users.where({name: req.params.name}).findOne(function(err, item){
		if(err) return res.json(err);
		console.log(!!item);
		if(!item) return res.json(item);
		else{
			Users.populate(item, { path:'profile' }, function(err, item){
				if(err) return res.json(err);
				else {
					req.session.user = req.params.name;
					return res.json(item);
				}
			});
		}
	});
};
// LOGIN CHECK  isLogined
exports.isLogined = function(req,res) {
	if(req.session.user) {
		return res.send(req.session.user);
	} else {
		return res.send(false);
	}
};
exports.logout = function(req, res){
	req.session.destroy();
	return res.end();
};
// DELETE USER
exports.deleteUser = function(req, res) {
	Users.remove({_id: req.params._id}, function(err){
		if(err) return;
		res.redirect('/');
	});
};
// UPSERT AVATAR
exports.changeProfile = function(req,res){
	Users.where({_id: req.body.userId}).findOne(function(err, user){
		if(!err){
			Profile.where({userId: req.body.userId}).findOne(function(err,item){
				if(err) res.json(err);
				if(!item){
				//初めてプロフィールを作る場合
					var profile = new Profile({
						userId: req.body.userId,
						photo: req.body.photo
					});
					profile.save(function(err){
						if(err) return err;
						user.profile = profile._id;
						user.save(function(err){
							if(err) return res.json(err);
							res.end();
						});
					});
				}
				else{
					item.photo = req.body.photo;
					item.save(function(err){
						if(err) return res.json(err);
						return res.end();
					});
				}
			});
		}
	});
};
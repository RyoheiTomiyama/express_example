var mongoose = require('mongoose');

var Users = mongoose.model('User');
var Profile = mongoose.model('Profile');
var Album = mongoose.model('Album');
var Albumfile = mongoose.model('Albumfile');

exports.findAlbums = function(req,res){
	// console.log(req.body);
	Album.find({userId: req.body.userId}, function(err,item){
		if(err) return res.json(err);
		return res.json(item);
	});
};

exports.open = function(req,res){
	Album.where({ _id: req.body._id }).findOne(function(err, item){
		if(err) return res.json(err);
		console.log(item);
		return res.json(item);
		// // 画像取得
		// Album.populate(item, {path: 'photos'}, function(err,data){
		// 	console.log(data);
		// 	return res.json(data);
		// });
	});
};
exports.openImage = function(req,res){
	Albumfile.where({_id: req.body._id}).findOne(function(err,item){
		if(err) return res.json(err);
		return res.json(item);
	})
}

exports.add = function(req,res){
	console.log(req.body);
	var file = new Albumfile({
		albumId: req.body.albumId,
		name: req.body.name,
		src: req.body.src
	});
	file.save(function(err){
		if(err) return res.json(err);
		// return res.json(file);
		Album.where({_id: req.body.albumId}).findOne(function(err, item){
			if(err) return res.json(err);
			console.log(item);
			if(!item.photos){
				item.photos = [];
			}
			item.photos.push(file._id);
			item.save(function(err){
				console.log(item);
				if(err) res.json(err);
				return res.json(file);
			});
		});
	});

};
exports.deletePhoto = function(req,res){
	Albumfile.remove({_id: req.body._id}, function(err){
		if(err) return res.json(err);
		Album.where({_id: req.body.albumId}).findOne(function(err,item){
			if(err) return res.json(err);
			var pt = item.photos.indexOf(req.body._id);
			console.log(pt);
			if(pt != -1){
				item.photos.splice(pt,1);
				console.log(item);
				item.save(function(err){
					if(err) return res.json(err);
					return res.json('削除しました。');
				});
			}
			else return res.send('削除できませんでした。');
		});
	});
};
exports.allDelete = function(req,res){

};

exports.save = function(req,res){

}
// アルバム作成
exports.create = function(req,res){
	var album = new Album({
		userId: req.body.userId,
		album: req.body.album
	});
	album.save(function(err){
		console.log(err);
		res.send(album);
		// res.end();
	});
};
// アルバム削除
exports.delete = function(req,res){
	Album.findOneAndRemove({_id: req.body._id}, function(err,item){
		Albumfile.remove({albumId: req.body._id}, function(err){
			if(err) return res.json(err);
			else return res.send('削除しました。');
		});
	});
};

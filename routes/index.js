// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });
// router.get('/test', function(req, res, next) {
//   res.render('partials/test', { title: 'test' });
// });
// module.exports = router;


exports.index = function(req, res){
  res.render('layout');
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.modal = function (req, res) {
  var name = req.params.name;
  res.render('partials/modal/' + name);
};
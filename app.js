var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
// mongooseの読み込み
var mongoose = require('mongoose');

// Modelの設定
var db = require('./model/database');

// Controllerの設定
var routes = require('./routes/index');     // 各ページ
// var users = require('./routes/users');
var api = require('./routes/api');    // mongoデータ


// Viewの設定
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
// app.get('*', routes .index);
// app.use('/', routes);
// app.use('/users', users);
app.get("/api/users", api.users);
app.get("/api/users/:name", api.user);
app.post("/api/users", api.createUser);
app.get("/api/users/delete/:_id", api.deleteUser);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



// データを保存する例
// var users = new Users();
// users.name = "tomiyama";
// users.age = "23";
// users.save(function(err){
//   if(!err) console.log('saved');
// });

// app.get('/', function(req,res){
//   Users.find({}, function(error, users) {
//     if(!error){
//     res.render('index', {
//       // engineersにはMongoDBから取得したデータが返されるので、そのままJadeに渡す
//       users: users
//     });
//     }
//   });
// });






// app.post("/api/users", function(req, res){
//   var user = req.body;
//   if(user._id) user._id = mongoose.ObjectID(user._id);
//   users.save(user, function(){
//     res.send("insert or update");
//   });
// });

// app.delete("/api/users/:_id", function(req, res) {
//   users.remove({_id: mongoose.ObjectID(req.params._id)}, function() {
//     res.send("delete");
//   });
// });


module.exports = app;

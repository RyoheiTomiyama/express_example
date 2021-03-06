var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
// mongooseの読み込み
var mongoose = require('mongoose');

// Modelの設定
var db = require('./model/database');

// Controllerの設定
var routes = require('./routes/index');     // 各ページ
// var users = require('./routes/users');
var api = require('./routes/api');    // mongoデータ
// var album = require('./routes/album');    // mongoデータ


// Viewの設定
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ imit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session にユーザー情報保存
app.use(session({
  secret: 'secret',
  resave: false,
  saveUnitialized: false,
  cookie: {
    maxAge: 30*24*60*60*1000
  }
}));

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('/partials/modal/:name', routes.modal);
// app.get('*', routes .index);
// app.use('/', routes);
// app.use('/users', users);
app.get("/api/users", api.users);
app.get("/api/users/:name", api.user);
app.post("/api/users", api.createUser);
app.get("/api/session", api.isLogined);
app.get("/api/logout", api.isLogined);
app.post("/api/changeProfile", api.changeProfile);
app.get("/api/users/delete/:_id", api.deleteUser);
app.post("/api/album/create", api.album.create); // 新規アルバム
app.post("/api/album/delete", api.album.delete); // アルバム削除
app.post("/api/album/findAlbums", api.album.findAlbums); //　アルバム一覧
app.post("/api/album/open", api.album.open); // アルバム情報取得
app.post("/api/album/openImage", api.album.openImage); // アルバム画像取得(一枚ずつ)
app.post("/api/album/add", api.album.add); // 写真追加
app.post("/api/album/update", api.album.update); // 写真更新
app.post("/api/album/deletePhoto", api.album.deletePhoto); // 写真削除


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

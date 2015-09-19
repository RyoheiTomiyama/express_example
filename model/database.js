var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/test");
var db = mongoose.connection;
// console.log(db.users);
db.on('error', console.error.bind(console, 'connection error:'));
db.on('connected', function(){
  console.log('connected');
});

var usersSchema = new mongoose.Schema({
  name: String,
  password: String
});
// 定義
mongoose.model('User', usersSchema);


// サンプル生成
// var User = mongoose.model('User');
// User.find({}).remove(function() {
//     User.create({
//         name: '田中_2'
//     }, {
//         name: '鈴木_2'
//     }, function(err) {
//         console.log('finished populating Users' +err);
//     });
// });
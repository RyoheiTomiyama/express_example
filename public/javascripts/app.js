'use strict';

var app = angular.module('myApp', ["ui.router","ngResource","ui.bootstrap","ctrl"]);
app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    // stateを記入
    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode(true);
    $stateProvider
    .state('login', {
        // auth: true,
        url: "/",
        templateUrl: "partials/firstpage",
        controller: "LoginCtrl"
    })
    .state('userList',{
        url: "/users",
        templateUrl: "partials/test",
        controller: "UserListCtrl"
    })
    .state('base',{
        templateUrl: "partials/base"
    })
    .state('base.userPage',{
        auth: true,
        url: "/user",
        templateUrl: "partials/userPage",
        controller: "UserPageCtrl"
    })
    .state('base.myPage',{
        auth: true,
        url: "/mypage",
        templateUrl: "partials/myPage",
        controller: "MyPageCtrl"
    })
    .state('base.albumPage',{
        auth: true,
        url: "/album",
        templateUrl: "partials/albumpage",
        controller: "AlbumPageCtrl"
    })
    ;
});
// app.factory('User', function($resource) {
//     return $resource('/api/users/:_id');

// });

// ログイン認証
app.run(['$rootScope', '$state', '$q', 'userModel', 'SharedService', function($rootScope,$state, $q, userModel, SharedService){
    $rootScope.$on('$stateChangeStart', function(e,toState,toParams,fromState,fromParams){
        if (!toState.auth) {    // authプロパティが存在しなければチェックせずに終了
            return;
        }
        console.log('checklogin...');
        userModel.isLogined().success(function(res){
            console.log(res);
            if(!!res) {
                console.log('login');
                $q.when(userModel.findUser(res))
                .then(function(item){
                    SharedService.user.set(item);
                });
            }
            else {  // ログインしていなければ
                console.log('not login');
                e.preventDefault();
                $state.go('login');
            }
        });
    });
}]);
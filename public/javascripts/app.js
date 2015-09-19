'use strict';

var app = angular.module('myApp', ["ui.router","ngResource","ctrl"]);
app.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    // stateを記入
    $urlRouterProvider.otherwise("/");
    $locationProvider.html5Mode(true);
    $stateProvider
    .state('login', {
        url: "/",
        templateUrl: "partials/firstpage",
        controller: "MainCtrl"
    })
    .state('userList',{
        url: "/users",
        templateUrl: "partials/test",
        controller: "MainCtrl"
    })
    .state('userPage',{
        auth: true,
        url: "/user",
        templateUrl: "partials/userPage",
        controller: "LoginCtrl"
    })
    ;
});
// app.factory('User', function($resource) {
//     return $resource('/api/users/:_id');

// });

// ログイン認証
app.run(['$rootScope', '$state', 'userModel', function($rootScope,$state,userModel){
    $rootScope.$on('$stateChangeStart', function(e,toState,toParams,fromState,fromParams){
        if (!toState.auth) {    // authプロパティが存在しなければチェックせずに終了
            return;
        }
        userModel.isLogined();  // ログインしていなければ
    });
}]);
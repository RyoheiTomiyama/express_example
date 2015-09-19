'use strict';
var ctrl = angular.module('ctrl', ["ui.router","ngResource","ngCookies"]);

ctrl.service("userModel", ["$http", "$q", "$state", "$cookies", function($http, $q, $state, $cookies){
	var self = this; //service内で関数を使うとき
	var _data = null;
	this.findUser =  function(name){
		var defer = $q.defer();
		$http.get('api/users/' + name).success(function(user){
			defer.resolve(user);
		});
		return defer.promise;
	};
	this.setUser = function(data){
		_data = data;
	};
	this.getUser = function(){
		return _data;
	}
	this.isLogined = function(){
		var userr = $cookies.getObject('user');
		console.log(userr.name);
		if($cookies.getObject('user')){
			self.setUser($cookies.getObject('user'));
		} else{
			$state.go("userList");
		}
	}
	this.login = function(data){
		$q.when(self.findUser(data.name))
		.then(function(user){
			if(data.password == user.password) {
				self.setUser(user);
				console.log(user);
				$cookies.putObject('user', user);
				$state.go("userPage");
			}
		});
	};
	this.logout = function(){
		$cookies.remove('user');
		_data = null;
	};
}]);
ctrl.controller("MainCtrl", function($scope, $http, $q, $state, userModel) {
    // $scope.users = User;
    $scope.getUser = function(){
        $http.get('api/users').success(function(users){
            $scope.users = users;
        });
    };
    $scope.getOneUser = function(){
    	var deferral = $q.defer();
    	var name = $scope.user.name;
    	// get user data from nickname
    	$http.get('api/users/' + name).success(function(user){
    		$scope.you = user;
    		deferral.resolve(user);
    	});
		return deferral.promise;
    }
    // Add User
    $scope.createUser = function() {
    	console.log($scope.data);
        if ($scope.data && $scope.data.name && $scope.data.password) {
            $http({
                method: 'POST',
                url: '/api/users',
                data: $scope.data
            })
            .success(function(){
                $scope.users.push({
                    name: $scope.data.name,
                    password: $scope.data.password
                });
                $scope.data = '';
                // $scope.user.age = '';
            });
        }
    };
    //　Delete User
    $scope.deleteUser = function(_id) {
        $http.get('/api/users/delete/'+_id)
        .then(function(res){
            console.log(res);
            $scope.getUser();
        }, function(err){
            console.log(err);
        });
    };
    $scope.loginUser = function(){
    	// $q.when($scope.getOneUser())
    	// .then(function(data){
	    // 	if($scope.user.password == $scope.you.password) console.log("login success");
	    // 	$state.go("userPage({name:" + $scope.you.name + "})");
    	// });
    	userModel.login($scope.user);
    };
    $scope.getUser();
});



ctrl.controller("LoginCtrl", function($scope, $http, $q, $state, $cookies, userModel) {
	$scope.user = userModel.getUser();
	$scope.logout = function(){
		userModel.logout();
		$state.go('login');
	};
});
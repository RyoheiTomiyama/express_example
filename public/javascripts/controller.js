'use strict';
var ctrl = angular.module('ctrl', ["ui.router","ngResource","ngCookies", "flow"]);
ctrl.config(['flowFactoryProvider', function (flowFactoryProvider) {
    flowFactoryProvider.factory = fustyFlowFactory;
}]);
ctrl.factory("SharedService", ["$rootScope", function($rootScope) {
    var user = {};

    return {
        user: {
            get: function() { return user; },
            set: function(t) {
                console.log("[enter] user.set");
                user = t;
                console.log(user);
                $rootScope.$broadcast('changedUser');
                console.log("[leave] user.set");
            }
        }
    };
}]);


ctrl.service("userModel", ["$http", "$q", "$state", "$cookies", "$resource", "SharedService", function($http, $q, $state, $cookies, $resource, SharedService){
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
	};
	this.reloadUser = function(){
		return $resource('api/users/:name', {name: '@name'});
	};
	// ログインしているかをsessionから確認
	this.isLogined = function(){
		return $http.get('api/session');
	};
	this.login = function(data){
		console.log(data);
		if(data.name != "" && data.password != ""){
			$q.when(self.findUser(data.name))
			.then(function(user){
				console.log(user);
				if(data.password == user.password) {
					self.setUser(user);
					console.log(user);
					// $cookies.putObject('user', user);
					$state.go("base.userPage");
				}
			});
		}
	};
	this.logout = function(){
		// $cookies.remove('user');
		// var a = $resource("api/logout").get();
		$http.get("api/logout")
		.then(function(res){
			SharedService.user.set({});
			console.log('logout'+ a);
			_data = null;
		});
	};
}]);
ctrl.controller("AllCtrl", function($scope, $http, $q, $state, $cookies, userModel, SharedService){
	$scope.user = SharedService.user.get();
	$scope.$on('changedUser', function() {
		console.log("[enter] changedUser");
		$scope.user = SharedService.user.get();
		console.log($scope.user);
		console.log("[leave] changedUser");
	});
	// $scope.isLogined = function(){
	// 	return userModel.isLogined();
	// };
	// if($scope.isLogined()){
	// 	$q.when(userModel.findUser($cookies.getObject('user').name))
	// 	.then(function(data){
	// 		$scope.user = data;
	// 	});
	// 	console.log($scope.user);
	// }
	// ログアウト
	$scope.logout = function(){
		userModel.logout();
		$state.go('login');
	};
});
ctrl.controller("LoginCtrl", function($scope, $http, $q, $state, userModel, SharedService) {
	$scope.data = "";
	$scope.user = "";

	$scope.checkLogin = function(){
		if(userModel.isLogined()){
			$state.go('base.userPage');
		}
	};
	$scope.checkLogin();
	// Add User
	$scope.createUser = function() {
		console.log($scope.data);
		if ($scope.data && $scope.data.name && $scope.data.password) {
			$q.when(userModel.findUser($scope.data.name))
			.then(function(user){
				console.log(!!user);
				if(!!user) console.log("this name is exist");
				else {
					$http({
						method: 'POST',
						url: '/api/users',
						data: $scope.data
					})
					.success(function(){
						// $scope.users.push({
						//     name: $scope.data.name,
						//     password: $scope.data.password
						// });
					$scope.data = '';
					console.log('registered');
				});
				}
			});
		}
	};

	// ユーザー名が被っていないかチェック
	$scope.checkUser = function(){
		$q.when(userModel.findUser($scope.data.name))
		.then(function(user){
			$scope.isUser = !!user;
			console.log(user);
		});
	};

	$scope.loginUser = function(){
		// $q.when($scope.getOneUser())
		// .then(function(data){
		//  if($scope.user.password == $scope.you.password) console.log("login success");
		//  $state.go("userPage({name:" + $scope.you.name + "})");
		// });
		userModel.login($scope.user);
	};
});
ctrl.controller("UserListCtrl", function($scope, $http, $q, $state, userModel, SharedService){
	$scope.getUser = function(){
		$http.get('api/users').success(function(users){
			$scope.users = users;
		});
	};
	$scope.getUser();

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
 });

// ログイン後
ctrl.controller("UserPageCtrl", function($scope, $http, $q, $state, $cookies, $modal, userModel, SharedService) {
	// $scope.user = userModel.getUser();
	$scope.user = SharedService.user.get();
	$scope.$on('changedUser', function() {
		console.log("[enter] changedUser");
		$scope.user = SharedService.user.get();
		console.log("[leave] changedUser");
	});
	console.log($scope.user);

	$scope.changeAvatar = function(){
		$modal.open({
			templateUrl: 'partials/modal/avatarModal',
			controller: 'AvatarCtrl'
		})
		.result.then(function(result){
			if(result == 'success'){
				userModel.reloadUser().get({name: $scope.user.name},function(data){
					userModel.setUser(data);
					$scope.user = data;
				});
				// $q.when(userModel.reloadUser($cookies.getObject('user').name))
				// .then(function(data){
				// 	$scope.user = data;
				// });
				// $scope.user = userModel.reloadUser($cookies.getObject('user').name);
			}
		},function(){
			console.log('modal missed');
		});
	};
});
ctrl.controller("AvatarCtrl", function($scope, $http, $q, $state, $cookies, $modalInstance, userModel, SharedService) {
	$scope.user = SharedService.user.get();
	$scope.$on('changedUser', function() {
		console.log("[enter] changedUser");
		$scope.user = SharedService.user.get();
		console.log("[leave] changedUser");
	});

	$scope.$watch('avatar', function(img){
		$scope.addNewFile(img);
	});
	$scope.avatarSrc = undefined;
	$scope.addNewFile = function(file){
		if(!file || !file.type.match('image.*')){
			return;
		}
		var reader = new FileReader();
		reader.onload = function(){
			$scope.$apply(function(){
				$scope.avatarSrc = reader.result;
				// $scope.upfile = file;
			});
			$scope.moveItem();
		}
		//read as url(reader.result = url)
		reader.readAsDataURL(file);
	};
	$scope.moveItem = function(){
		$scope.imgW = $('.drag_image').width();
		var imgH = $('.drag_image').height();
		var posX = $('.drag_image').position().left;
		var posY = $('.drag_image').position().top;

		var dX = 200 - $scope.imgW;
		var dY = 200 - imgH;
		$('.drag_image,.cut_image').css({
			top: dY/2,
			left: dX/2
		});
	};

	// 作成ボタンをおした時
	$scope.createAvatar = function(){
		var $cut_image = $('.cut_image');
		var ratio = 1*($('.ratio_button').position().left + $('.ratio_button').width()/2)/250*2;
		var sX = $cut_image.position().left/ratio*(-1);
		var sY = $cut_image.position().top/ratio*(-1);
		var sW = 200/ratio;
		var sH = 200/ratio;
		var src = $cut_image.attr('src');
		var canvas = document.getElementById("create_image");
		if (!canvas) return false;
		if (!canvas.getContext ) { return false; }

		var ctx = canvas.getContext('2d');
		var img = new Image();
		img.src = src;
		/* 画像が読み込まれるのを待ってから処理を続行 */
		img.onload = function() {
			ctx.clearRect(0,0,200,200);
			ctx.drawImage(img, sX, sY, sW, sH, 0, 0, 200, 200);
			var createSrc = canvas.toDataURL('image/png');
			$scope.changeProfile(createSrc);
		};
	};
	// ボタンをおした時
	$scope.changeProfile = function(photo){
		var data = {};
		data['userId'] = $scope.user._id;
		data['photo'] = photo;
		console.log(data);
		$http({
			method: 'POST',
			url: '/api/changeProfile',
			data: data
		})
		.success(function(){
			console.log('profile');
			$modalInstance.close('success');
			$scope.user.profile = data;
			SharedService.user.set($scope.user);
		});
	};
})
//directive
.directive('fileModel',function($parse){
    return{
        restrict: 'A',
        link: function(scope,element,attrs){
            var model = $parse(attrs.fileModel);
            element.bind('change',function(){
                scope.$apply(function(){
                    model.assign(scope,element[0].files[0]);
                });
            });
        }
    };
})
// ドラッグ＆ドロップ
.directive('fileDropZone',function(){
    return{
        restrict: 'A',
        scope:{onDropFile: '&'},
        link: function(scope,element,attrs){
            //when dragover & enter
            var processDragOverOrEnter = function(event){
                event.stopPropagation();
                event.preventDefault();
                //背景色変更
                element.css('background-color','#aaa');
            }
            //when drop
            var processDrop = function(event){
                event.stopPropagation();
                event.preventDefault();
                element.css('background-color',"#fff");
                scope.onDropFile({file:event.dataTransfer.files[0]});
            }
            var processDragLeave = function(event){
                //背景色戻す
                element.css('background-color',"#fff");
            }
            //bind event to function
            element.bind('dragover',processDragOverOrEnter);
            element.bind('dragenter',processDragOverOrEnter);
            element.bind('drop',processDrop);
            element.bind('dragleave',processDragLeave);
        }
    }
});


ctrl.controller('AlbumPageCtrl', function($scope, $http, $q, $state, $cookies, userModel, SharedService){
	$scope.$watch('addPhoto', function(img){
		$scope.addNewFile(img);
	});
	$scope.avatarSrc = [];
	$scope.addNewFile = function(file){
		console.log(file);
		//////

		// 複数ファイル読み込み完了
		// scopeに格納を行うコード未完


		////
		// if(!file || !file.type.match('image.*')){
		// 	return;
		// }
		var reader = new FileReader();
		reader.onload = function(){
			$scope.$apply(function(){
				console.log(reader.result);
				$scope.avatarSrc = reader.result;
				// $scope.upfile = file;
			});
			$scope.moveItem();
		}
		//read as url(reader.result = url)
		reader.readAsDataURL(file);
	};
})
//directive
.directive('multifileModel',function($parse){
    return{
        restrict: 'A',
        link: function(scope,element,attrs){
        	console.log(attrs);
            var model = $parse(attrs.multifileModel);
            element.bind('change',function(){
                scope.$apply(function(){
        			console.log(element);
                    model.assign(scope,element[0].files);
                });
            });
        }
    };
});
ctrl.controller('MyPageCtrl', function($scope, $http, $q, $state, $cookies, userModel, SharedService){
	// upload later on form submit or something similar
    $scope.submit = function() {

    };
    // upload on file select or drop
    $scope.upload = function (file) {

    };

});
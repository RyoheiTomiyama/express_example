'use strict';
var ctrl = angular.module('ctrl', ["ui.router","ngResource", "flow", "ngFileUpload", "ngStorage", "ngTagsInput"]);
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


ctrl.service("userModel", ["$http", "$q", "$state", "$resource", "$localStorage", "SharedService", function($http, $q, $state, $resource, $localStorage, SharedService){
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
	// this.isLogined = function(){
	// 	return $http.get('api/session');
	// };
	this.isLogined = function(){
		return $localStorage.user;
	};
	this.login = function(data){
		if(data.name != "" && data.password != ""){
			$q.when(self.findUser(data.name))
			.then(function(user){
				if(data.password == user.password) {
					self.setUser(user);
					$localStorage.user = user.name;
					console.log(user);
					$state.go("base.userPage");
				}
			});
		}
	};
	this.logout = function(){
		// var a = $resource("api/logout").get();
		$http.get("api/logout")
		.then(function(res){
			SharedService.user.set({});
			delete $localStorage.user;
			console.log('logout');
			_data = null;
		});
	};
}]);
ctrl.controller("AllCtrl", function($scope, $http, $q, $state, userModel, SharedService){
	$scope.user = SharedService.user.get();
	$scope.$on('changedUser', function() {
		console.log("[enter] changedUser");
		$scope.user = SharedService.user.get();
		console.log($scope.user);
		console.log("[leave] changedUser");
	});
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
		// userModel.isLogined().success(function(res){
		// 	if(!!res) $state.go('base.userPage');
		// });
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
ctrl.controller("UserPageCtrl", function($scope, $http, $q, $state, $modal, userModel, SharedService) {
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
			}
		},function(){
			console.log('modal missed');
		});
	};
});
ctrl.controller("AvatarCtrl", function($scope, $http, $q, $state, $modalInstance, userModel, SharedService) {
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
		var ratio = 1*($('.ratio_button').position().left + 10)/250*2;
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
		sX = sX*img.width/600;
		sY = sY*img.width/600;
		sW = sW*img.width/600;
		sH = sH*img.width/600;
		// console.log(img.width);
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


ctrl.controller('AlbumPageCtrl', function($scope, $http, $q, $state, userModel, SharedService, Upload){
	// $scope.$watch('addPhoto', function(img){
	// 	$scope.addNewFile(img);
	// });
	// $scope.avatarSrc = [];
	// $scope.addNewFile = function(file){
	// 	console.log(file);
	// 	//////

	// 	// 複数ファイル読み込み完了
	// 	// scopeに格納を行うコード未完


	// 	////
	// 	// if(!file || !file.type.match('image.*')){
	// 	// 	return;
	// 	// }
	// 	var reader = new FileReader();
	// 	reader.onload = function(){
	// 		$scope.$apply(function(){
	// 			console.log(reader.result);
	// 			$scope.avatarSrc = reader.result;
	// 			// $scope.upfile = file;
	// 		});
	// 		$scope.moveItem();
	// 	}
	// 	//read as url(reader.result = url)
	// 	reader.readAsDataURL(file);
	// };

// --------------------------------------------------------------
		// ngFileUpload
// ----------------------------------------------------------------
	 // for multiple files:
	$scope.saveFiles = function(files){
		$scope.uploadFiles(files);
	}
    $scope.uploadFiles = function (files) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          Upload.upload({url:'', data: {file: files[i]}})
          .then(function(result){
          	console.log("success");
          },function(result){
          	console.log("failed");
          });
        }
      }
      else{
      	console.log("no file");
      }
    };

    //----------------CREATE ALBUM----------------//
    $scope.create = function(name){
    	console.log($scope.user);
    	$http({
    		method: 'POST',
    		url: '/api/album/create',
    		data: {
    			userId: $scope.user._id,
    			album: name
    		}
    	})
    	.then(function(result){
    		$scope.albums.push(result.data);
    	}, function(err){
    		console.log(err);
    	});
    };

    //----------------DELETE ALBUM----------------//
    $scope.delete = function(id, index){
    	$http({
    		method: 'POST',
    		url: '/api/album/delete',
    		data: {
    			_id: id,
    		}
    	})
    	.then(function(result){
    		$scope.albums.splice(index, 1);
    	}, function(err){
    		console.log(err);
    	});
    };

    //-----------FIND ALBUM-------------//
    $scope.findAlbums = function(){
    	$http({
    		method: 'POST',
    		url: '/api/album/findAlbums',
    		data: {
    			userId: $scope.user._id
    		}
    	})
    	.success(function(result){
    		$scope.albums = result;
    		console.log(result);
    	})
    	.error(function(result){
    		console.log(result);
    	});
    };
    $scope.findAlbums();
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
ctrl.controller('OneAlbumPageCtrl', function($scope, $http, $q, $state, $modal, $localStorage, userModel, SharedService, Upload){
	// console.log($state);
	$scope.name = $state.params.name;
	$scope.items = []; // 写真
	if($state.params.albumId != null){
		$localStorage.albumId = $state.params.albumId;
		$scope.albumId = $state.params.albumId;
	}
	else{
		$scope.albumId = $localStorage.albumId;
	}

	$scope.open = function(){
		$http.post('/api/album/open',{_id: $scope.albumId})
		.success(function(result){
			console.log(result);
			var photoIds = result.photos;
			// 1枚ずつ画像を読み込むUX向上
			$scope.items = new Array(photoIds.length);
			photoIds.forEach(function(_id,index){
				$http.post('/api/album/openImage', {_id: _id })
				.success(function(result){
					console.log(index);
					$scope.items[index] = result;
					console.log($scope.items);
				})
				.error(function(result){
					console.log(result);
				});
			});
		})
		.error(function(result){
			console.log(result);
		});
	};
	$scope.open();

	$scope.change = function(){
		console.log("change");
	};
	$scope.$watch('tests',function(){
		console.log('dsfh');
	});

	var reader;
	var handleFileSelect = function(ev){
		console.log("handler");
		reader = new FileReader();
		reader.onerror = function(e){
			console.log(e);
		};
		reader.onprogress = function(e){
			console.log("progress");
		};
		reader.onabort = function(e) {
			alert('File read cancelled');
		};
		reader.onloadstart = function(e) {
			console.log("loadstart");
			console.log(ev.target.files.length);
			for(var i=0; i<ev.target.files.length; i++){
				$scope.items.push({});
			}
		};
		reader.onloadend = function(e){
			console.log("loadend");
		}
		// Read in the image file as a binary string.
		reader.readAsBinaryString(ev.target.files[0]);
	};
	document.getElementById('files').addEventListener('change', handleFileSelect, false);

	$scope.addPhotos = function(files){
		console.log('dsfh');
		if (files && files.length) {
			var itemCount = $scope.items.length-files.length;
			for(var i=0; i<files.length; i++){
				$scope.items[itemCount+i] = {
					name: "",
					comment: ""
				};
			}
			files.forEach(function(file,index){
					Upload.dataUrl(file,true).then(function(url){
					$http({
						method: 'POST',
						url: '/api/album/add',
						data: {
							albumId: $scope.albumId,
							name: file.name,
							src: url
						}
					})
					.then(function(result){
						console.log("success");
						// console.log(result);
						$scope.items[itemCount+index] = result.data;
					},function(result){
						console.log("failed");
					});
				});
			});
		}
		else{
			console.log("no file");
		}
	};
	$scope.updateComment = function(item){
		$http({
			method: 'POST',
			url: '/api/album/update',
			data:{
				_id: item._id,
				item: item.comment
			}
		}).then(function(res){
			console.log(res);
		},function(err){console.log(err)});
	}
	$scope.deletePhoto = function(item){
		$modal.open({
			templateUrl: 'partials/modal/confirmModal',
			controller: function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close('close');
				};
				$scope.cancel = function(){
					$modalInstance.dismiss('cancel');
				};
			}
		})
		.result.then(function(res){
			$http.post('/api/album/deletePhoto', {_id: item._id, albumId: $scope.albumId})
			.success(function(result){
				console.log(result);
				var delete_pt = $scope.items.indexOf(item);
				console.log(delete_pt);
				$scope.items.splice(delete_pt,1);
			});
		},function(){
			console.log('cancel');
		});
	};


	/*--------------------- TAG ------------------------*/
	$scope.tags = [];
	var compositionJustEnd = false;
	$(document).on('compositionend','.checkKeyUp', function(){
		compositionJustEnd = true;
	});
	$scope.createTag = function(e, tag){
	// 変換候補を決定するためのEnterだったら無視
		if(e.keyCode === 13 && !compositionJustEnd){
			if(!!tag && tag.length != 0){
				$scope.tags.push(tag);
				$scope.org = "";
			}
		} else {
			compositionJustEnd = false;
		}
	}
	$scope.delete_tag = function(index){
		$scope.tags.splice(index,1);
	};
});
// タグを編集するためのディレクティブ
ctrl.directive('cmEditableText', function () {
    return {
        restrict : 'A',
        require  : '^ngModel',
        link     : function(scope, element, attrs, ngModel) {
            ngModel.$render = function() {
                element.html(ngModel.$viewValue);
            };
            element.on('dblclick', function() {
                var clickTarget = angular.element(this);
                var EDITING_PROP = 'editing';
                if ( !clickTarget.hasClass(EDITING_PROP) ) {
                    clickTarget.addClass(EDITING_PROP);
                    clickTarget.html('<input type="text" class="checkKeyUp" value="' + ngModel.$viewValue + '" />');
                    var inputElement = clickTarget.children();
                    inputElement.on('focus', function() {
                        inputElement.on('blur', function() {
                            var inputValue = inputElement.val() || this.defaultValue;
                            clickTarget.removeClass(EDITING_PROP).text(inputValue);
                            inputElement.off();
                            scope.$apply(function() {
                                ngModel.$setViewValue(inputValue);
                            });
                        });
                    });
                    inputElement[0].focus();
                }
            });
            var destroyWatcher = scope.$on('$destroy', function () {
                if ( angular.equals(destroyWatcher, null) ) {
                    return;
                }
                element.off();
                destroyWatcher();
                destroyWatcher = null;
            });
        }
    };
});

ctrl.controller('MyPageCtrl', function($scope, $http, $q, $state, userModel, SharedService){
	// upload later on form submit or something similar
    $scope.submit = function() {

    };
    // upload on file select or drop
    $scope.upload = function (file) {

    };

});
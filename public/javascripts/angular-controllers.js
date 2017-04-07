var controllers = {};
controllers.login = function ($scope, $http, $location,FileUploader) {;


};
controllers.register = function($scope,$http){

};
controllers.main = function($scope,$http){
	$scope.houses = [];
	$scope.test = "asdass";
	$scope.setup =function(){
		houses($scope,$http);
	};
	//$scope.toggelSwitch = test;
};
app.controller(controllers);
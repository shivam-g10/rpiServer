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
	$scope.toggelSwitch = function(house){
		var controllerId = $("#"+house._id).find("select").val();
		if(controllerId!="None"){
			let controller = house.controllers[controllerId];
			let url = "";
			if(controller.status){
				url = "/house/turnOn";
			}else{
				url = "/house/turnOff";
			}
			$http({
				url:url,
				method:'POST',
				data:{
					house:house,
					controller:controller
				}
			}).then((data)=>{
				console.log(data);
			});
		}
		
	}
};
app.controller(controllers);
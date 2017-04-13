angular.module('todo', ['ionic']).controller('cards',function($scope,$http){
	$scope.houses = [];
	$scope.error = {};
	$scope.setup = function(){
		console.log("test");
		$http.get("http://fyp-13bec0547.herokuapp.com/getData").success(function(data){$scope.houses=data.houses;}).error(function(err){$scope.error=err;alert("error")});
	};
	$scope.setup();
	$scope.toggleSwitch =function (house){
		console.log(house);
		var controllerId = $("#"+house._id).find("select").val();
		console.log(controllerId);
		if(controllerId!="None"){
			let controller = house.controllers[controllerId];
			let url = "";
			if(!controller.status){
				url = "http://fyp-13bec0547.herokuapp.com/house/trunOn";
			}else{
				url = "http://fyp-13bec0547.herokuapp.com/house/trunOff";
			}
			console.log(url);
			$http({
				url:url,
				method:'POST',
				data:{
					house:house,
					controller:controllerId
				}
			}).then((data)=>{
				console.log(data);
				$scope.setup();
				alert("Command Sent");
			});
		}
		
	};
});
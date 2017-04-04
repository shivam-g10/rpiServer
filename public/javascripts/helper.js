function edit($http, $scope, editData) {
    $http({
        method: 'POST',
        url: '/input/edit',
        data: $.param(editData),  // pass in data as strings
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}  // set the headers so angular passing info as form data (not request payload)
    })
        .success(function (data) {
            console.log(data);
            // if successful, bind success message to message
                $scope.msg = data.message;
                alert($scope.msg+data.name);
                clearData($scope);

        }).error(function(data){console.log(data);});
}
function houses( $scope,$http) {
    $http({
        method: 'GET',
        url: '/getData', // pass in data as strings  // set the headers so angular passing info as form data (not request payload)
    }).then(function (data) {
        
                $scope.houses = data.data.houses;

        });
}
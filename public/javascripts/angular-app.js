var app = angular.module('cloud', ['ngRoute']);
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/main',
            controller: 'main'
        })
        .otherwise({
            redirectTo: '/'
        });
});
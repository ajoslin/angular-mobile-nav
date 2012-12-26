var app = angular.module('myApp', ['mobile-navigate'])

app.config(function($routeProvider) {
  $routeProvider.when("/one", {
    template: '<div style="height: 400px; background:blue;">Hello! I am page one.</div>'
  }).when("/two", {
    template: '<div style="height: 400px; background:red;">What\'s up! This is page two!</div>'
  });
});

app.controller('MainCtrl', function($scope, $route, $navigate, $location) {
  $scope.route = $route;
  $scope.nav = $navigate;
  
  $scope.history = $navigate.history;

  $scope.path = function() {
    return $location.path();
  };
});


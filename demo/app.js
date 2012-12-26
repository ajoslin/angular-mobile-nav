var app = angular.module('myApp', ['mobile-navigate'])

app.config(function($routeProvider) {
  $routeProvider.when("/one", {
      template: '<div style="height: 300px; background:blue; border: 2px solid black;">Hello! I am page one.</div>'
  }).when("/two", {
      template: '<div style="height: 300px; background:red; border: 2px solid black;">What\'s up! This is page two!</div>'
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


var app = angular.module('myApp', ['mobileNav'])

app.config(function($routeProvider) {
  $routeProvider.when("/one", {
    template: '<div class="page" style="background:blue;">Hello! I am page one.</div>'
  }).when("/two", {
    template: '<div class="page" style="background:red;">What\'s up! This is page two!</div>'
  });
});

app.controller('MainCtrl', function($scope, $route, $mobileNav, $location) {
  $scope.name = 'World';
  $scope.route = $route;
  $scope.nav = $mobileNav;
  $scope.history = function() { 
    return $mobileNav.history.map(function(h) {
      return h.path;
    });
  };
  $scope.path = function() {
    return $location.path();
  };
});


angular.module('myApp', ['mobile-navigate'])
.config(function($routeProvider) {
  $routeProvider.when("/one", {
    templateUrl: "page1.html",
  }).when("/two", {
    templateUrl: "page2.html",
    transition: "modal" //this is overwritten by the go() in home.html
  }).when("/popup", {
    templateUrl: "popup.html",
    transition: "modal"
  }).when("/monkey", {
    templateUrl: "monkey.html"
  }).when("/", {
    templateUrl: "home.html"
  }).otherwise({
    redirectTo: "/"
  });
})
.controller('MainCtrl', function($scope, $navigate) {
  $scope.$navigate = $navigate;
  $navigate.go('/','none');
})
.directive('ngTap', function() {
  var isTouchDevice = !!("ontouchstart" in window);
  return function(scope, elm, attrs) {
    if (isTouchDevice) {
      var tapping = false;
      elm.bind('touchstart', function() { tapping = true; });
      elm.bind('touchmove', function() { tapping = false; });
      elm.bind('touchend', function() { 
        tapping && scope.$apply(attrs.ngTap);
      });
    } else {
      elm.bind('click', function() {
        scope.$apply(attrs.ngTap);
      });
    }
  };
});


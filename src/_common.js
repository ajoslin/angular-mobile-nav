/*
 * angular-mobile-nav by Andy Joslin
 * http://github.com/ajoslin/angular-mobile-nav
 * @license MIT License http://goo.gl/Z8Nlo
 */

angular.module('ajoslin.mobile-navigate', [])
.run(['$navigate', '$rootScope', function($navigate, $rootScope) {
  //Android back button functionality for phonegap
  document.addEventListener("deviceready", function() {
    document.addEventListener("backbutton", function() {
      $rootScope.$apply(function() {
        var backSuccess = $navigate.back();
        if (!backSuccess) {
          navigator.app.exitApp();
        }
      });
    });
  });
}]);

angular.module('mobile-navigate').service('$navigate', ['$rootScope', '$location',
function($rootScope, $location) {
  var self = this,
    navHistory = []; //we keep our own version of history and ignore window.history

  function Page(path, transition) {
    this.path = path;
    this.transition = transition || 'slide';
  }
  
  function navigate(destination, source, isBack) {
    $rootScope.$broadcast('$pageTransitionStart', destination, source, isBack);
    self.current = self.next;
  }

  /* 
   * Will listen for a route change success and call the selected callback
   * Only one listen is ever active, so if you press for example 
   * /link1 then press back before /link1 is done, it will go listen for the back
   */
  self.onRouteSuccess = angular.noop; //default value
  $rootScope.$on('$routeChangeSuccess', function() {
    self.onRouteSuccess();
  });

  self.go = function go(path, transition) {
    $location.path(path);
    //Wait for successful route change before actually doing stuff
    self.onRouteSuccess = function() {
      self.current && navHistory.push(self.current);
      self.next = new Page(path, transition);
      navigate(self.next, self.current, false);
    };
  };
  //Sometimes you want to erase history
  self.eraseHistory = function() {
    navHistory.length = 0;
  };
  self.back = function() {
    if (navHistory.length > 0) {
      var previous = navHistory[navHistory.length-1];
      $location.path(previous.path);
      self.onRouteSuccess = function() {
        navHistory.pop();
        self.next = previous;
        navigate(self.next, self.current, true);
      };
      return true;
    }
    return false;
  };

  //Android back button functionality for phonegap
  if ((window.cordova || window.phonegap) && window.device && 
    device.platform && device.platform.toLowerCase() == "android") {
    document.addEventListener("deviceready", function() {
      document.addEventListener("backbutton", function() {
        var backSuccess = self.back();
        if (!backSuccess) {
          navigator.app.exitApp();
        }
      });
    });
  }
}]);

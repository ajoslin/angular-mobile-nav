angular.module('mobile-navigate').service('$navigate', ['$rootScope', '$location', '$route',
function($rootScope, $location, $route) {
  var self = this,
    navHistory = []; //we keep our own version of history and ignore window.history

  function Page(path, transition, isReverse) {
    var _path = path,
      _transition = transition || 'slide',
      _isReverse = isReverse,
      _onceTransition;

    this.transition = function() {
      var trans;
      if (_onceTransition) {
        trans = _onceTransition;
        _onceTransition = null;
      } else {
        trans = _transition;
      }
      return trans;
    };
    this.path = function() { return _path; };
    this.reverse = function() { return _isReverse; };

    //For setting a transition on a page - but only one time
    //Eg say on startup, we want to transition in with 'none',
    //but want to be 'slide' after that
    this.transitionOnce = function(trans) {
      _onceTransition = trans;
    };
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
  self.onRouteSuccess = null;
  //Add a default onroutesuccess for the very first page
  function defaultRouteSuccess($event, next, last) {
    self.current && navHistory.push(self.current);
    self.next = new Page($location.path());
    self.next.transitionOnce('none');
    navigate(self.next);
    self.onRouteSuccess = null;
  }
  $rootScope.$on('$routeChangeSuccess', function($event, next, last) {
    // Only navigate if it's a valid route and it's not gonna just redirect immediately
    if (!next.$$route || !next.$$route.redirectTo) {
      (self.onRouteSuccess || defaultRouteSuccess)($event, next, last);
    }
  });

  /*
   * go -transitions to new page
   * @param path - new path
   * @param {optional} String transition
   * @param {optional} boolean isReverse, default false
   */
  self.go = function go(path, transition, isReverse) {
    if (typeof transition == 'boolean') {
      isReverse = transition;
      transition = null;
    }
    $location.path(path);
    //Wait for successful route change before actually doing stuff
    self.onRouteSuccess = function($event, next, last) {
      self.current && navHistory.push(self.current);
      self.next = new Page(path, transition || (next.$$route && next.$$route.transition), isReverse);
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
      $location.path(previous.path());
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
  document.addEventListener("deviceready", function() {
    document.addEventListener("backbutton", function() {
      var backSuccess = self.back();
      if (!backSuccess) {
        navigator.app.exitApp();
      }
    });
  });
}]);

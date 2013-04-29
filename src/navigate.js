angular.module('ajoslin.mobile-navigate')

.provider('$navigate', function() {
  this.$get = ['$rootScope', '$location', '$route', function($rootScope, $location, $route) {
    var nav = {},
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
      nav.current = nav.next;
    }

    /* 
     * Will listen for a route change success and call the selected callback
     * Only one listen is ever active, so if you press for example 
     * /link1 then press back before /link1 is done, it will go listen for the back
     */
    nav.onRouteSuccess = null;
    //Add a default onroutesuccess for the very first page
    function defaultRouteSuccess($event, next, last) {
      nav.current && navHistory.push(nav.current);
      nav.next = new Page($location.path());
      nav.next.transitionOnce('none');
      navigate(nav.next);
      nav.onRouteSuccess = null;
    }
    $rootScope.$on('$routeChangeSuccess', function($event, next, last) {
      // Only navigate if it's a valid route and it's not gonna just redirect immediately
      if (!next.$$route || !next.$$route.redirectTo) {
        (nav.onRouteSuccess || defaultRouteSuccess)($event, next, last);
      }
    });

    /*
     * go -transitions to new page
     * @param path - new path
     * @param {optional} String transition
     * @param {optional} boolean isReverse, default false
     */
    nav.go = function go(path, transition, isReverse) {
      if (typeof transition == 'boolean') {
        isReverse = transition;
        transition = null;
      }
      $location.path(path);
      //Wait for successful route change before actually doing stuff
      nav.onRouteSuccess = function($event, next, last) {
        nav.current && navHistory.push(nav.current);
        nav.next = new Page(path, transition || (next.$$route && next.$$route.transition), isReverse);
        navigate(nav.next, nav.current, false);
      };
    };
    //Sometimes you want to erase history
    nav.eraseHistory = function() {
      navHistory.length = 0;
    };
    nav.back = function() {
      if (navHistory.length > 0) {
        var previous = navHistory[navHistory.length-1];
        $location.path(previous.path());
        nav.onRouteSuccess = function() {
          navHistory.pop();
          nav.next = previous;
          navigate(nav.next, nav.current, true);
        };
        return true;
      }
      return false;
    };

    return nav;
  }];
});

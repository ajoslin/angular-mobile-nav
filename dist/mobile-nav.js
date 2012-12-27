angular.module('mobile-navigate', []);
/* $change
 * Service to transition between two elements 
 */
angular.module('mobile-navigate').factory('$change', ['$q', '$timeout', function($q, $timeout) {
  var transitionPresets = {  //[destClass, sourceClass]
    //Modal: new page pops up, old page sits there until new page is over it
    'modal': ['modal', ''],
    'none': ['', '']
  }, defaultOptions = {
      'prefix': 'mb-'
  }, inClass = "in", outClass = "out", showClass = "shown";

  return function change(dest, source, transType, reverse, options) {
    options = angular.extend(options || {}, defaultOptions);
    var deferred = $q.defer(),
      destClass, sourceClass, destTransClass, sourceTransClass;

    function addClass(el, cls) {
      el && el.addClass(options.prefix + cls);
    }
    function removeClass(el, cls) {
      el && el.removeClass(options.prefix + cls);
    }

    //Convert a preset (eg 'modal') to its array of preset classes if it exists
    //else, just convert eg 'slide' to ['slide', 'slide'], so both elements get it
    //The array layout is [destinationClass, sourceClass]
    transition = transitionPresets[transType] ?
      transitionPresets[transType] : 
      [transType, transType];
    
    destClass = reverse ? outClass : inClass;
    sourceClass = reverse ? inClass : outClass;
    destTransClass = transition[reverse ? 1 : 0];
    sourceTransClass = transition[reverse ? 0 : 1];

    addClass(dest, destClass);
    addClass(dest, destTransClass);
    addClass(source, sourceTransClass);

    //A timeout so the inclass has time to apply itself
    setTimeout(function() {
      //Move destination from outside page to shown
      removeClass(dest, destClass);
      addClass(dest, showClass);
      //Move source from shown to outside page
      removeClass(source, showClass);
      addClass(source, sourceClass);
    },30); //TODO fix bug where classes don't apply on slower mobile browsers. 30ms timeout is temp fix

    function done() {
      //$timeout so scope is sure to digest on resolve
      $timeout(deferred.resolve);
    }

    //Find which element (sometimes none) to bind for ending
    var boundElement;
    if (destTransClass && destTransClass.length) {
      (boundElement = dest).bind('webkitTransitionEnd', done);
    } else if (source && sourceTransClass && sourceTransClass.length) {
      (boundElement = source).bind('webkitTransitionEnd', done);
    } else {
      deferred.resolve();
    }

    deferred.promise.then(function() {
      boundElement && boundElement.unbind('webkitTransitionEnd', done);
      removeClass(dest, destTransClass);
      removeClass(source, sourceTransClass);
    });

    //Let the user of change 'cancel' to finish transition early if they wish
    deferred.promise.cancel = function() {
      deferred.resolve();
    };
    return deferred.promise;
  };
}]);
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

angular.module('mobile-navigate').directive('mobileView', ['$rootScope', '$compile', '$controller', '$route', '$change',
function($rootScope, $compile, $controller, $route, $change) {


  function link(scope, viewElement, attrs) {    
    //Insert page into dom
    function insertPage(page) {
      var current = $route.current, 
      locals = current && current.locals;

      page.element = angular.element(document.createElement("div"));
      page.element.html(locals.$template);
      page.element.addClass('mb-page'); //always has to have page class
      page.scope = scope.$new();
      if (current.controller) {
        locals.$scope = page.scope;
        page.controller = $controller(page.route.controller, locals);
        page.element.contents().data('$ngControllerController', page.controller);
      }
      $compile(page.element.contents())(page.scope);
      viewElement.append(page.element);
      page.scope.$emit('$viewContentLoaded');
      page.scope.$eval(attrs.onLoad);
    }
    //Remove page from dom
    function destroyPage(page) {
    }
    function Transition(dest, source, reverse) {
    }

    var currentTrans;
    scope.$on('$pageTransitionStart', function transitionStart($event, dest, source, reverse) {
      function transition() {
        var promise;

        insertPage(dest);
        promise = $change(dest.element, (source ? source.element : null),
          (reverse ? source.transition : dest.transition), reverse);

        promise.then(function() {
          if (source) {
            $rootScope.$broadcast('$pageTransitionSuccess', dest, source);
            source.scope.$destroy();
            source.element.remove();
            source = undefined;
          }
        });

        return promise;
      }
      currentTrans && currentTrans.cancel();
      currentTrans = transition(dest, source, reverse);
    });
  }
  return {
    restrict: 'EA',
    link: link
  };
}]);

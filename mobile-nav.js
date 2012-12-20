/*
  TODO: Add phonegap event listener for android back button
  TODO: Make android back button exit app if history stack is empty
  TODO: Make transition type configurable either by class name or give transition type strings people can use ("slide", "slideVertical", etc)
*/

angular.module('mobileNav', [])
.service('$mobileNav', ['$rootScope', '$route', '$location', 
function($rootScope, $route, $location) {
  var self = this;  
  
  function Page(path, noHistory) {
    this.path = path;
    this.noHistory = !!noHistory;
  }
  
  function navigate(inPage, outPage, isBack) {
    var direction = isBack ? -1 : 1;
    $rootScope.$broadcast('$pageTransitionStart', self.nextPage, self.currentPage, direction);
    self.currentPage = self.nextPage;
  };

  //We keep our own history
  self.history = [];
  /* 
   * Will listen for a route change success and call the selected callback
   * Only one listen is ever active, so if you press for example 
   * /link1 then /back before /link1 is done, it will go listen for the /back
   */
  self.onRouteSuccess = angular.noop; //default value
  $rootScope.$on('$routeChangeSuccess', function() {
    self.onRouteSuccess();
  });

  self.go = function go(path, noHistory) {
    $location.path(path);
    //Wait for successful route change before actually doing stuff
    self.onRouteSuccess = function() {
      if (self.currentPage && !self.currentPage.noHistory) {
        self.history.push(self.currentPage);
      }
      self.nextPage = new Page(path, noHistory);
      navigate(self.nextPage, self.currentPage, false);
    };
  };
  //For things like tab bars, you want to go somewhere but not write history
  self.goNoHistory = function goNoHistory(path) {
    return self.go(path, true);
  }
  self.back = function back() {
    var previousPage;
    if (self.history.length > 0) {
      //If the last item is the same as the current one, we'll pop until it's different so back works
      //This weird situation of going back to same page can happen because of goNoHistory
      while ((previousPage = self.history[self.history.length-1]).path == $location.path()) {
        self.history.pop();
      }
      $location.path(previousPage.path);
      self.onRouteSuccess = function() {
        self.history.pop();
        self.nextPage = previousPage;
        navigate(self.nextPage, self.currentPage, true);
      };
      return true;
    }
    return false;
  }

  //Android back button functionality for phonegap
  if ((window.cordova || window.phonegap) && window.device && 
    device.name && device.name.toLowerCase() == "android") {
    document.addEventListener("deviceready", function() {
      //TODO lookup phonegap droid back button event
      document.addEventListener("backbutton", function() {
        morePagesLeft = self.back();
        if (!morePagesLeft) {
          //TODO lookup exit app command for no pages left
        }
      });
    });
  }
}])
.directive('mobileView', ['$rootScope', '$compile', '$controller', '$mobileNav', '$route', '$timeout', '$q',
function($rootScope, $compile, $controller, $mobileNav, $route, $timeout, $q) {
  
  function link(scope, viewElement, attrs) {    
    //Insert page into dom
    function insertPage(page) {
      var current, e,
        locals = (current = $route.current) && $route.current.locals;
      //angular.element() errors when you give it just a template, so we do this
      (e = document.createElement("div")).innerHTML = locals.$template;
      
      page.element = angular.element(e.children[0]);
      page.element.addClass("page"); //always has to have page class
      page.scope = scope.$new();
      if (current.controller) {
        locals.$scope = page.scope;
        page.controller = $controller(page.route.controller, locals);
        page.element.contents().data('$ngControllerController', page.controller)
      }
      $compile(page.element.contents())(page.scope);
      viewElement.append(page.element);
      page.scope.$emit('$viewContentLoaded');
      page.scope.$eval(attrs.onLoad);
    }
    //Remove page from dom
    function destroyPage(page) {
      page.scope.$destroy();
      page.element.remove();
      page = null;
    }
    function Transition(inPage, outPage, direction) {
      direction = direction || 1;
      var inClass = direction == 1 ? "left" : "right",
        outClass = direction == 1 ? "right" : "left",
        showClass = 'shown',
        self = this;

      self.done = false;
      insertPage(inPage);
      inPage.element.addClass(inClass);
      //Add a timeout so the inClass has time to take effect
      setTimeout(function() {
        inPage.element.addClass(showClass);
        inPage.element.removeClass(inClass);
        if (outPage) {
          outPage.element.removeClass(showClass);
          outPage.element.addClass(outClass);
        }
      });
      function transitionDone() {
        scope.$apply(self.finish);
      }
      inPage.element.bind('webkitTransitionEnd', transitionDone);

      self.finish = function() {
        $rootScope.$broadcast('$pageTransitionSuccess', inPage, outPage);
        inPage.element.unbind('webkitTransitionEnd', transitionDone);
        if (outPage) {
          destroyPage(outPage);
        }
        self.done = true;
      };
    }
    var currentTrans;
    scope.$on('$pageTransitionStart', function($event, inPage, outPage, direction) {
      if (currentTrans && !currentTrans.done) {
        currentTrans.finish();
      }
      currentTrans = new Transition(inPage, outPage, direction);
    });
  }
  return {
    restrict: 'EA',
    link: link
  };
}]);

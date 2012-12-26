/*
  TODO: Make transition type configurable either by class name or give transition type strings people can use ("slide", "slideVertical", etc)
*/
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
        page.element.contents().data('$ngControllerController', page.controller)
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

angular.module('mobile-navigate').factory('$change', ['$q', '$timeout', function($q, $timeout) {
  var transitionPresets = {  //[destClass, sourceClass]
    //Modal: new page pops up, old page stays
    'modal': ['modal', ''],
    'none': ['', '']
  };
  var defaultOptions = {
    'prefix': 'mb-',
    'reverse': false
  };
  var inClass = "in", outClass = "out", showClass = "shown";

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
    });

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
  }
}]);

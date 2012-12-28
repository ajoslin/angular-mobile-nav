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
  }, IN_CLASS = "in",
    OUT_CLASS = "out", 
    REVERSE_CLASS = "reverse",
    ANIMATION_END = "webkitAnimationEnd";

  return function change(dest, source, transType, reverse, options) {
    options = angular.extend(options || {}, defaultOptions);
    var deferred = $q.defer(),
      destTransClass, sourceTransClass;

    function buildClassString(classes) {
      var classStr = "";
      for (var i=0, ii=classes.length; i<ii; i++) {
        if (classes[i].length) {
          classStr += " mb-" + classes[i];
        }
      }
      return classStr;
    }

    //Convert a preset (eg 'modal') to its array of preset classes if it exists
    //else, just convert eg 'slide' to ['slide', 'slide'], so both elements get it
    //The array layout is [destinationClass, sourceClass]
    transition = transitionPresets[transType] ?
      transitionPresets[transType] : 
      [transType, transType];

    var destClasses = buildClassString([
      reverse ? OUT_CLASS : IN_CLASS,
      (destTransClass = transition[reverse ? 1 : 0]),
      reverse && REVERSE_CLASS || ''
    ]);
    dest.addClass(destClasses);

    var sourceClasses;
    if (source) {
      sourceClasses = buildClassString([
       reverse ? IN_CLASS : OUT_CLASS,
       (sourceTransClass = transition[reverse ? 0 : 1]),
       reverse && REVERSE_CLASS || ''
      ]);
      source.addClass(sourceClasses);
    }


    function done() {
      //If a page is removed after being 'higher up' in z-index than the new page,
      // it will flicker over the new page for a sec before being destroyed. this fixes that.
      source && source.css('z-index', 0);
      //$timeout so scope is sure to digest on resolve. the timeout also lets the z-index apply
      $timeout(deferred.resolve);
    }

    //Find which element (sometimes none) to bind for ending
    var boundElement;
    if (destTransClass && destTransClass.length) {
      (boundElement = dest).bind(ANIMATION_END, done);
    } else if (source && sourceTransClass && sourceTransClass.length) {
      (boundElement = source).bind(ANIMATION_END, done);
    } else {
      deferred.resolve();
    }

    deferred.promise.then(function() {
      boundElement && boundElement.unbind(ANIMATION_END, done);
      dest.removeClass(destClasses);
      source && source.removeClass(sourceClasses);
    });

    //Let the user of change 'cancel' to finish transition early if they wish
    deferred.promise.cancel = function() {
      deferred.resolve();
    };
    return deferred.promise;
  };
}]);

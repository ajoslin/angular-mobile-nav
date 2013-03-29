/* 
 * $change
 * Service to transition between two elements 
 */
angular.module('mobile-navigate').factory('$change', ['$q', '$rootScope', function($q, $rootScope) {
  var transitionPresets = {  //[nextClass, prevClass]
    //Modal: new page pops up, old page sits there until new page is over it
    'modal': ['modal', ''],
    'none': ['', '']
  }, defaultOptions = {
      'prefix': 'mb-'
  }, IN_CLASS = "in",
    OUT_CLASS = "out", 
    REVERSE_CLASS = "reverse",
    DONE_CLASS = "done",
    ANIMATION_END = "webkitAnimationEnd";

  return function change(next, prev, transType, reverse, options) {
    options = angular.extend(options || {}, defaultOptions);
    var deferred = $q.defer(),
      nextTransClass, prevTransClass;

    //buildClassString
    //Transforms array of classes into prefixed class string
    //(better for performance than multiple .addClass()
    //@param classes: Array{string}
    //@return string classNames
    function buildClassString(classes) {
      return classes.reduce(function(accumulator, cls) {
        return accumulator + (cls ? (' ' + options.prefix + cls) : '');
      }, '');
    }

    //Convert a preset (eg 'modal') to its array of preset classes if it exists
    //else, just convert eg 'slide' to ['slide', 'slide'], so both elements get it
    //The array layout is [nextinationClass, prevClass]
    var transition = transitionPresets[transType] ?
      transitionPresets[transType] : 
      [transType, transType];

    //Hack for white flash: z-index stops flash, offsetWidth thing forces z-index to apply
    next.css('z-index','-100');
    next[0].offsetWidth += 0;

    var nextClasses = buildClassString([
      reverse ? OUT_CLASS : IN_CLASS,
      (nextTransClass = transition[reverse ? 1 : 0]),
      reverse && REVERSE_CLASS || ''
    ]);
    next.addClass(nextClasses);

    var prevClasses;
    if (prev) {
      prevClasses = buildClassString([
       reverse ? IN_CLASS : OUT_CLASS,
       (prevTransClass = transition[reverse ? 0 : 1]),
       reverse && REVERSE_CLASS || ''
      ]);
      prev.addClass(prevClasses);
    }

    next.css('z-index', '');
    next[0].offsetWidth += 0;

    function done() {
      $rootScope.$apply(function() {
        deferred.resolve();
      });
    }

    //Find which element (sometimes none) to bind for ending
    var boundElement;
    if (nextTransClass && nextTransClass.length) {
      (boundElement = next).bind(ANIMATION_END, done);
    } else if (prev && prevTransClass && prevTransClass.length) {
      (boundElement = prev).bind(ANIMATION_END, done);
    } else {
      deferred.resolve();
    }

    deferred.promise.then(function() {
      boundElement && boundElement.unbind(ANIMATION_END, done);
      next.removeClass(nextClasses);
      prev && prev.removeClass(prevClasses);
    });

    //Let the user of change 'cancel' to finish transition early if they wish
    deferred.promise.cancel = function() {
      deferred.resolve();
    };
    return deferred.promise;
  };
}]);

/*
 * $change
 * Service to transition between two elements
 */
angular.module('ajoslin.mobile-navigate')

.provider('$change', function() {
  var transitionPresets = {  //[nextClass, prevClass]
    //Modal: new page pops up, old page sits there until new page is over it
    'modal': ['modal', ''],
    'none': ['', '']
  };
  var defaultOptions = {
      'prefix': 'mb-'
  };
  var IN_CLASS = "in";
  var OUT_CLASS = "out";
  var REVERSE_CLASS = "reverse";
  var DONE_CLASS = "done";

  this.setTransitionPreset = function(transitionName, inClass, outClass) {
    inClass = inClass || '';
    outClass = outClass || inClass; //Default to outClass same as inClass
    transitionPresets[transitionName] = [inClass, outClass];
  };
  this.options = function(opts) {
    defaultOptions = angular.extend(defaultOptions, opts || {});
  };

  this.$get = ['$q', '$rootScope', '$sniffer', function($q, $rootScope, $sniffer) {
    //TODO remove this fix when angular-1.2 comes out
    //This fixes a known bug with android $sniffer in angular-1.1.x not finding prefix properly
    if (!$sniffer.vendorPrefix) {
      if (angular.isString( $document[0].body.style.webkitTransition )) {
        $sniffer.vendorPrefix = 'webkit';
      }
    }
    var ANIMATION_END = $sniffer.vendorPrefix ? 
      $sniffer.vendorPrefix.toLowerCase() + 'AnimationEnd' :
      'animationend';

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
  }];
});

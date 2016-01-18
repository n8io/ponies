(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('delayClass', delayClass)
    ;

  /* @ngInject */
  function delayClass($timeout) {
    return {
      restrict: 'A',
      link: linkFn
    };

    /* @ngInject */
    function linkFn($scope, element, attrs) {
      const ms = parseInt(attrs.delayClassMs, 0);
      const klass = attrs.delayClass || 'resolved';

      $timeout(function() {
        element.addClass(klass);
      }, ms);
    }
  }
})();

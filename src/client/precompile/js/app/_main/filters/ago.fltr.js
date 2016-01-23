(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('ago', ago)
    ;

  /* @ngInject */
  function ago(MomentService) {
    return function(val) {
      return angular.isNumber(val) ? MomentService(val).fromNow() : '';
    };
  }
})();

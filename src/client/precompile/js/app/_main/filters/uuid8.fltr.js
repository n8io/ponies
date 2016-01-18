(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('uuid8', uuid8)
    ;

  /* @ngInject */
  function uuid8() {
    return function(val) {
      return angular.isString(val) ? val.substring(0, 8) : val;
    };
  }
})();

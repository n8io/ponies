(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('urlEncode', urlEncode)
    ;

  /* @ngInject */
  function urlEncode($window) {
    return function(val) {
      return angular.isString(val) ? $window.encodeURIComponent(val) : val;
    };
  }
})();

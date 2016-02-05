(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('ago', ago)
    ;

  /* @ngInject */
  function ago(moment) {
    return function(val) {
      return angular.isNumber(val) ? moment(val).fromNow() : '';
    };
  }
})();

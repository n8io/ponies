(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('md5', md5)
    ;

  /* @ngInject */
  function md5(CryptoService) {
    return function(val) {
      return angular.isString(val) ? CryptoService.MD5(val).toString() : val;
    };
  }
})();

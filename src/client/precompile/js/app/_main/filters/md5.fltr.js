(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('md5', md5)
    ;

  /* @ngInject */
  function md5(CryptoJs) {
    return function(val) {
      return angular.isString(val) ? CryptoJs.MD5(val).toString() : val;
    };
  }
})();

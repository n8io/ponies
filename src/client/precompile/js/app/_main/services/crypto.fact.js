(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('CryptoJs', cryptoService)
    ;

  /* @ngInject */
  function cryptoService() {
    return CryptoJS; // eslint-disable-line
  }
})();

(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('CryptoService', CryptoService)
    ;

  /* @ngInject */
  function CryptoService() {
    return CryptoJS; // eslint-disable-line
  }
})();

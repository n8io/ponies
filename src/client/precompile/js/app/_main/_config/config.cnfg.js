(function() {
  'use strict';

  angular
    .module('app')
    .config(config)
    ;

  /* @ngInject */
  function config($httpProvider) {
    // Setup csrf protection
    $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
    $httpProvider.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
  }
})();

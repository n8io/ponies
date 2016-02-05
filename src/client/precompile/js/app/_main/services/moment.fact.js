(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('moment', momentService)
    ;

  /* @ngInject */
  function momentService() {
    return moment; // eslint-disable-line
  }
})();

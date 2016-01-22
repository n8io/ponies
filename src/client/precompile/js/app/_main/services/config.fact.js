(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('ConfigService', ConfigService)
    ;

  /* @ngInject */
  function ConfigService($http) {
    return {
      getConfig: getConfig
    };

    function getConfig() {
      return $http.get('/api/config/ng');
    }
  }
})();

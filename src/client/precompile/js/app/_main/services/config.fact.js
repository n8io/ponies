(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('ConfigService', ConfigService)
    ;

  /* @ngInject */
  function ConfigService($http) {
    let config;

    return {
      getConfig: getConfig
    };

    function getConfig() {
      return new Promise(function(resolve) {
        if (config) {
          return resolve(config);
        }

        $http
          .get('/api/config/ng')
          .then(function(results) {
            config = results.data;

            return resolve(config);
          })
          ;
      });
    }
  }
})();

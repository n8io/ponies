(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('ConfigService', configService)
    ;

  /* @ngInject */
  function configService($http) {
    let config;

    return {
      get: get
    };

    function get() {
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

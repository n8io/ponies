(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('d3', d3Service)
    ;

  /* @ngInject */
  function d3Service() {
    return d3; // eslint-disable-line
  }
})();

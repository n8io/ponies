(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('D3Service', D3Service)
    ;

  /* @ngInject */
  function D3Service() {
    return d3; // eslint-disable-line
  }
})();

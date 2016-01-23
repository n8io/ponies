(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('MomentService', MomentService)
    ;

  /* @ngInject */
  function MomentService() {
    return moment; // eslint-disable-line
  }
})();

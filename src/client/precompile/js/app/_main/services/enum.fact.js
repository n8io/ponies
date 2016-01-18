(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('EnumService', EnumService)
    ;

  /* @ngInject */
  function EnumService() {
    return {
      EVENTS: {
        CLIENT: {
          READY: 'clientReady'
        }
      }
    };
  }
})();

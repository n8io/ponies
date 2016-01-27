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
      },
      PUBNUB: {
        INSTANCE: 'default',
        CHANNELS: {
          WAGER: 'wager',
          WAGER_SYNC: 'sync',
          ALL_WAGERS: 'wagers-all',
          ALL_RESULTS: 'results-all'
        }
      }
    };
  }
})();

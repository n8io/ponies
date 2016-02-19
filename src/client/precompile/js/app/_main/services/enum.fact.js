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
        ALL_WAGERS: 'wagers-all',
        ALL_RESULTS: 'results-all',
        SYNC: 'sync'
      }
    },
    PubNub: {
      Channels: {
        WAGERS: 'v2-wagers'
      }
    }
  };
}

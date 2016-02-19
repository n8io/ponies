angular
  .module('app.services')
  .factory('PubNub', pubNub)
  ;

/* @ngInject */
function pubNub() {
  return PUBNUB;
}

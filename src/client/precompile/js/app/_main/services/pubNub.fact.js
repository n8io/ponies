(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('PubNub', pubNub)
    ;

  /* @ngInject */
  function pubNub() {
    return PUBNUB; // eslint-disable-line
  }
})();

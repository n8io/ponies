(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('UtilityService', UtilityService)
    ;

  /* @ngInject */
  function UtilityService($window) {
    return {
      uuid: uuid
    };

    function uuid() {
      const templateStr = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

      return templateStr.replace(/[xy]/g, generateUuid);

      function generateUuid(c) {
        const hasCrypto = !!$window.crypto;
        let r = null;
        let v = null;

        if (hasCrypto) {
          r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
        }
        else {
          r = Math.random() * 16 | 0;
        }

        v = c === 'x' ? r : (r & 0x3 | 0x8);

        return v.toString(16);
      }
    }
  }
})();

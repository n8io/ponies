(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('tabIdentifier', tabIdentifier)
    ;

  /* @ngInject */
  function tabIdentifier($window, $log, $rootScope, $sessionStorage, EnumService, UtilityService) {
    return {
      restrict: 'E',
      link: linkFn
    };

    /* @ngInject */
    function linkFn(/* $scope, element, attrs */) {
      /*
        Window name is a poor man's way to avoid duplication across tabs. It prevents the issue that occurs when you right click and
        select "Duplicate tab" and it shares the sessionStorage information that we leverage to persist the unique client / tab id.
        Using the window name provides a string to check against.
      */
      const client = $sessionStorage.client || {};

      if (client.id !== $window.name) {
        client.id = $window.name || UtilityService.uuid();

        $sessionStorage.client = client;

        $window.name = client.id;

        $rootScope.broadcast(EnumService.EVENT.CLIENT.READY, client);
      }

      $log.info('Client id set', client.id); // eslint-disable-line
    }
  }
})();

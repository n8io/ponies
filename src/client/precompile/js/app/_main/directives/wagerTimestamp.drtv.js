(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wagerTimestamp', wagerTimestamp)
    ;

  /* @ngInject */
  function wagerTimestamp(TemplateUrls) {
    return {
      scope: {
        wager: '='
      },
      restrict: 'E',
      templateUrl: TemplateUrls.WAGER_TIMESTAMP
    };
  }
})();

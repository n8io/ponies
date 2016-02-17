(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('winningWagerDots', winningWagerDots)
    ;

  /* @ngInject */
  function winningWagerDots(TemplateUrls) {
    return {
      scope: {
        race: '='
      },
      replace: true,
      restrict: 'E',
      templateUrl: TemplateUrls.WINNING_WAGER_DOTS
    };
  }
})();

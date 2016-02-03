(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('winningWagerDots', winningWagerDots)
    ;

  /* @ngInject */
  function winningWagerDots() {
    return {
      scope: {
        race: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='wwd-container' data-ng-class='{shown: race.hide}'>
          <div class='wwd-wrapper'>
            <div class='wwd-dot' data-ng-repeat='wager in race | raceWinningWagers'>
            </div>
            <div class='clearfix'></div>
          </div>
          <div class='clearfix'></div>
        </div>
      `
    };
  }
})();

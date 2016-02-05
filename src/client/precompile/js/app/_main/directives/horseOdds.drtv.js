/* eslint-disable */
(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('horseOdds', horseOdds)
    ;

  /* @ngInject */
  function horseOdds() {
    return {
      scope: {
        horse: '=',
        fractional: '='
      },
      template: `
      <div class='horse-odds-container cursor-pointer' data-ng-click='fractional = !fractional'>
        <div class='horse-odds-wrapper'>
          <div class='horse-odds-actual'>
            <span data-ng-if='!fractional' data-ng-bind='horse.odds.NumOdds'></span>
            <span data-ng-if='fractional' data-ng-bind='horse.odds.TextOdds'></span>
          </div>
        </div>
      </div>
      `,
      replace: true,
      restrict: 'E'
    };
  }
})();

/* eslint-disable */
(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('horseMorningLine', horseMorningLine)
    ;

  /* @ngInject */
  function horseMorningLine() {
    return {
      scope: {
        horse: '=',
        fractional: '='
      },
      template: `
      <div class='horse-odds-container cursor-pointer' data-ng-click='fractional = !fractional'>
        <div class='horse-odds-wrapper'>
          <div class='horse-odds-morning-line'>
            <span data-ng-if='!fractional' data-ng-bind='horse.ML | fractionalToDecimal'></span>
            <span data-ng-if='fractional' data-ng-bind='horse.ML'></span>
          </div>
        </div>
      </div>
      `,
      replace: true,
      restrict: 'E'
    };
  }
})();

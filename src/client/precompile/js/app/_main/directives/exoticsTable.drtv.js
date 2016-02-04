(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('exoticsTable', exoticsTable)
    ;

  /* @ngInject */
  function exoticsTable() {
    return {
      scope: {
        exotics: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <table class='wps-details-exotic width-100pct'>
          <thead>
            <tr>
              <th class='exotic-header base'>Base Amt</th>
              <th class='exotic-header type'>Type</th>
              <th class='exotic-header combo'>Winning Combos</th>
              <th class='exotic-header payout'>Payout</th>
            </tr>
          </thead>
          <tbody>
            <tr data-ng-repeat='exotic in exotics'>
              <td>
                <div class='wps-detail-exotic-denomination' data-ng-bind='exotic.denomination | currency:"$":2'>
                </div>
              </td>
              <td>
                <div class='wps-detail-exotic-type' data-ng-if='exotic.type != "Pick-"' data-ng-bind='exotic.type'>
                </div>
                <div class='wps-detail-exotic-type' data-ng-if='exotic.type == "Pick-"' data-ng-bind='exotic.type + exotic.winCombo.length'>
                </div>
              </td>
              <td>
                <exotic-combos exotic='exotic'></exotic-combos>
              </td>
              <td>
                <div class='wps-detail-exotic-win-amount' data-ng-bind='exotic.winAmount | currency:"$":2'>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      `
    };
  }
})();

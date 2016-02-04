(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wpsDetails', wpsDetails)
    ;

  /* @ngInject */
  function wpsDetails() {
    return {
      scope: {
        race: '=',
        track: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='wps-details-container' data-ng-show='!!race.wps'>
          <div class='wps-details-wrapper'>
            <h4 data-ng-bind='track.DisplayName + ": Race " + race.id + " Results"'></h4>
            <table class='width-100pct'>
              <thead>
                <tr>
                  <th class='wps-header horse'>Horse</th>
                  <th class='wps-header win'>Win</th>
                  <th class='wps-header place'>Place</th>
                  <th class='wps-header show'>Show</th>
                </tr>
              </thead>
              <tbody>
                <tr data-ng-repeat='place in race.wps'>
                  <td>
                    <div class='wps-detail-horse' data-ng-bind='place.horse'></div>
                  </td>
                  <td>
                    <div class='wps-detail-win' data-ng-bind='place.winAmount | currency:"$":2'></div>
                  </td>
                  <td>
                    <div class='wps-detail-place' data-ng-bind='place.placeAmount | currency:"$":2'></div>
                  </td>
                  <td>
                    <div class='wps-detail-show' data-ng-bind='place.showAmount | currency:"$":2'></div>
                  </td>
                </tr>
              </tbody>
            </table>
            <exotics-table exotics='race.exotics'></exotics-table>
          </div>
        </div>
      `
    };
  }
})();

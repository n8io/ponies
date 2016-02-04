(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('race', race)
    ;

  /* @ngInject */
  function race() {
    return {
      scope: {
        race: '=',
        track: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='race-container'>
          <div class='race-wrapper cursor-pointer' data-ng-click='race.hide = onToggle(race) && !(race.hide === undefined ? race.softHide : race.hide)'>
            <div class='race-name float-left' data-ng-bind='"Race " + race.id'>
            </div>
            <wps track='track' race='race' class='float-left'></wps>
            <winning-wager-dots race='race' class='float-left'></winning-wager-dots>
            <div class='race-toggle float-right'>
              <i class='fa fa-angle-double-down' data-ng-if='!(race.hide === undefined ? race.softHide : race.hide)'></i>
              <i class='fa fa-angle-double-up' data-ng-if='race.hide === undefined ? race.softHide : race.hide'></i>
            </div>
            <div class='clearfix'></div>
          </div>
        </div>
      `,
      controller: controller
    };

    /* @ngInject */
    function controller($scope, $timeout) {
      $scope.onToggle = onToggle;

      function onToggle(race) {
        if (race.hideTO) {
          $timeout.cancel(race.hideTO);
        }

        race.hideTO = $timeout(function() {
          console.debug(`Setting hide to undefined.`, race); // eslint-disable-line

          race.hide = undefined;
        }, 1000 * 30);

        return true;
      }
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('track', track)
    ;

  /* @ngInject */
  function track() {
    return {
      scope: {
        track: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='track-container'
          data-ng-class='{collapsed: !track.races || (track.hide == undefined ? track.softHide: track.hide)}'
          data-ng-click='track.hide = onToggle(track) && !(track.hide === undefined ? track.softHide : track.hide)'>
          <div class='track-wrapper' data-ng-class='{"cursor-pointer": track.races}'>
            <div class='float-left track-name' data-ng-bind='track.DisplayName' title='{{track.DisplayName}}'>
            </div>
            <div class='float-left mtp-outer'>
              <mtp mtp='track.nextRace' />
            </div>
            <div class='track-toggle float-right' data-ng-if='track.races'>
              <i class='fa fa-angle-double-down' data-ng-if='!(track.hide === undefined ? track.softHide : track.hide)'></i>
              <i class='fa fa-angle-double-up' data-ng-if='track.hide === undefined ? track.softHide : track.hide'></i>
            </div>
            <div class='clearfix' />
          </div>
        </div>
      `,
      controller: controller
    };

    /* @ngInject */
    function controller($scope, $timeout) {
      $scope.onToggle = onToggle;

      if ($scope.track.nextRace.Status.toLowerCase() === 'closed') {
        $scope.track.softHide = true;
      }

      const hasActiveRaces = !!_($scope.track.races).values().value().find((r) => {
        return r.id >= $scope.track.nextRace.RaceNum + ($scope.track.nextRace.RaceStatus.toLowerCase() !== 'off' ? -1 : 0);
      });

      if (!hasActiveRaces) {
        $scope.track.softHide = true;
      }

      function onToggle(track) {
        if (track.hideTO) {
          $timeout.cancel(track.hideTO);
        }

        track.hideTO = $timeout(function() {
          console.debug(`Setting hide to undefined.`, track); // eslint-disable-line

          track.hide = undefined;
        }, 1000 * 60 * 5);

        return true;
      }
    }
  }
})();

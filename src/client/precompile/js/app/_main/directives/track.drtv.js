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
          data-ng-class='{collapsed: !track.races || track.races.length == 0 || (track.hide == undefined ? track.softHide: track.hide)}'
          data-ng-click='track.hide = onToggle(track) && !(track.hide === undefined ? track.softHide : track.hide)'>
          <div class='track-wrapper' data-ng-class='{"cursor-pointer": track.races.length > 0}'>
            <div class='float-left track-name' data-ng-bind='track.DisplayName' title='{{track.DisplayName}}'>
            </div>
            <div class='float-left mtp-outer'>
              <mtp mtp='track.nextRace' />
            </div>
            <div class='track-toggle float-right' data-ng-if='track.races.length > 0'>
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

      function onToggle(track) {
        if (track.hideTO) {
          $timeout.cancel(track.hideTO);
        }

        track.hideTO = $timeout(function() {
          console.debug(`Setting hide to undefined.`, track); // eslint-disable-line

          track.hide = undefined;
        }, 1000 * 30);

        return true;
      }
    }
  }
})();

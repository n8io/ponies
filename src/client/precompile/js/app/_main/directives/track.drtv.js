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
        <div class='track-container' data-ng-class='{collapsed: !track.races || track.races.length == 0 || track.hide}' data-ng-click='track.hide = !track.hide'>
          <div class='track-wrapper' data-ng-class='{"cursor-pointer": track.races.length > 0}'>
            <div class='float-left track-name' data-ng-bind='track.DisplayName' title='{{track.DisplayName}}'>
            </div>
            <div class='float-left mtp-outer'>
              <mtp mtp='track.nextRace' />
            </div>
            <div class='track-toggle float-right' data-ng-if='track.races.length > 0'>
              <i class='fa fa-angle-double-down' data-ng-if='!track.hide'></i>
              <i class='fa fa-angle-double-up' data-ng-if='track.hide'></i>
            </div>
            <div class='clearfix' />
          </div>
        </div>
      `
    };
  }
})();

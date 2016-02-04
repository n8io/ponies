(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wps', wps)
    ;

  /* @ngInject */
  function wps($mdBottomSheet) {
    return {
      scope: {
        race: '=',
        track: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='wps-container'
          data-ng-show='!!race.wps'
          data-ng-click='onWpsClick($event)'
          >
          <div class='wps-wrapper'>
            <span data-ng-bind='race.wps | wpsSelections'>
            </span>
          </div>
        </div>
      `,
      controller: controller
    };

    /* @ngInject */
    function controller($scope) {
      $scope.onWpsClick = onWpsClick;

      function onWpsClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        $mdBottomSheet.show({
          template: `
          <md-bottom-sheet>
            <wps-details track='$parent.track' race='$parent.race'></wps-details>
          </md-bottom-sheet>
          `,
          scope: $scope.$new(true)
        });
      }
    }
  }
})();

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
        wps: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='wps-container' data-ng-show='!!wps' data-ng-click='showPayouts(wps)'>
          <div class='wps-wrapper'>
            <span data-ng-bind='wps | wpsSelections'>
            </span>
          </div>
        </div>
      `,
      controller: controllerFn
    };

    function controllerFn() {
      const vm = this; // eslint-disable-line

      vm.showPayouts = showPayouts;

      function showPayouts(wps) {
        $mdBottomSheet.show({
          template: '<md-bottom-sheet>Hello!</md-bottom-sheet>'
        });
      }
    }
  }
})();

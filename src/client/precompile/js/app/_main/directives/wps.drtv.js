(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wps', wps)
    ;

  /* @ngInject */
  function wps() {
    return {
      scope: {
        wps: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='wps-container' data-ng-show='!!wps'>
          <div class='wps-wrapper'>
            <span data-ng-bind='wps | wpsSelections'>
            </span>
          </div>
        </div>
      `
    };
  }
})();

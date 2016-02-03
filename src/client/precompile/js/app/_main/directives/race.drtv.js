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
        race: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='race-container'>
          <div class='race-wrapper cursor-pointer' data-ng-click='race.hide = !race.hide'>
            <div class='race-name float-left' data-ng-bind='"Race " + race.id'>
            </div>
            <wps wps='race.wps' class='float-left'></wps>
            <winning-wager-dots race='race' class='float-left'></winning-wager-dots>
            <div class='race-toggle float-right'>
              <i class='fa fa-angle-double-down' data-ng-if='!race.hide'></i>
              <i class='fa fa-angle-double-up' data-ng-if='race.hide'></i>
            </div>
            <div class='clearfix'></div>
          </div>
        </div>
      `
    };
  }
})();

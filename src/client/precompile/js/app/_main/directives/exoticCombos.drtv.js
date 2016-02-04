(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('exoticCombos', exoticCombos)
    ;

  /* @ngInject */
  function exoticCombos() {
    return {
      scope: {
        exotic: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='wps-detail-exotic-combos-container'>
          <span class='wps-detail-exotic-combo'
            data-ng-repeat='combo in exotic.winCombo'>
              <span data-ng-bind='(!$first ? "/" : "") + combo'></span>
            </span>
          </span>
        </div>
      `
    };
  }
})();

  // {
  //   "type": "Pick-",
  //   "denomination": 0.503,
  //   "winCombo": [
  //     "6",
  //     "8,9",
  //     "2 3 of 3"
  //   ],
  //   "winAmount": 47.05
  // }

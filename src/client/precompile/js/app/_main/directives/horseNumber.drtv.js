(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('horseNumber', horseNumber)
    ;

  /* @ngInject */
  function horseNumber($timeout, ConfigService) {
    return {
      scope: {
        horse: '=',
        trackType: '='
      },
      restrict: 'E',
      replace: true,
      template: `
        <div class='horse-number-container cursor-pointer' data-ng-show='horse'>
          <div class='horse-number' data-ng-bind='horse'></div>
        </div>
      `,
      link: linkFn
    };

    /* @ngInject */
    function linkFn($scope, el) {
      const vm = $scope; // eslint-disable-line

      ConfigService
        .getConfig()
        .then(function(config) {
          if (!vm.horse || !vm.trackType || !config) {
            return;
          }

          $(el) // eslint-disable-line
            .css(config.colors[vm.trackType.toLowerCase()][parseInt(vm.horse, 0)])
            ;
        })
        ;
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('horseNumber', horseNumber)
    ;

  /* @ngInject */
  function horseNumber(TemplateUrls, $timeout, ConfigService) {
    return {
      scope: {
        horse: '=',
        trackType: '='
      },
      restrict: 'E',
      replace: true,
      templateUrl: TemplateUrls.HORSE_NUMBER,
      link: linkFn
    };

    /* @ngInject */
    function linkFn($scope, el) {
      const vm = $scope; // eslint-disable-line

      ConfigService
        .get()
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

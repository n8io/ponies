(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wpsDetails', wpsDetails)
    ;

  /* @ngInject */
  function wpsDetails(TemplateUrls) {
    return {
      scope: {
        race: '=',
        track: '='
      },
      replace: true,
      restrict: 'E',
      templateUrl: TemplateUrls.WPS_DETAILS,
      controller: controllerFn
    };

    /* @ngInject */
    function controllerFn($scope) {
      $scope.getHorseByProgramNumber = function(programNumber) {
        return _($scope.race.horses).values().value().find(function(h) {
          return h.ProgramNumber === programNumber;
        });
      };
    }
  }
})();

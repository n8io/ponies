(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wps', wps)
    ;

  /* @ngInject */
  function wps($mdBottomSheet, TemplateUrls) {
    return {
      scope: {
        race: '=',
        track: '='
      },
      replace: true,
      restrict: 'E',
      templateUrl: TemplateUrls.WPS,
      controller: controller
    };

    /* @ngInject */
    function controller($scope) {
      $scope.onWpsClick = onWpsClick;

      function onWpsClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        $mdBottomSheet.show({
          templateUrl: TemplateUrls.WPS_BOTTOM_SHEET,
          scope: $scope.$new(true)
        });
      }
    }
  }
})();

(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('race', race)
    ;

  /* @ngInject */
  function race(TemplateUrls) {
    return {
      scope: {
        race: '=',
        track: '='
      },
      replace: true,
      restrict: 'E',
      templateUrl: TemplateUrls.RACE,
      controller: controller
    };

    /* @ngInject */
    function controller($scope, $timeout) {
      $scope.onToggle = onToggle;

      if ($scope.track.nextRace.RaceNum > $scope.race.id + 1) {
        $scope.race.softHide = true;
      }

      function onToggle(race) {
        if (race.hideTO) {
          $timeout.cancel(race.hideTO);
        }

        race.hideTO = $timeout(function() {
          console.debug(`Setting hide to undefined.`, race); // eslint-disable-line

          race.hide = undefined;
        }, 1000 * 60 * 5);

        return true;
      }
    }
  }
})();

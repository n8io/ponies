angular
  .module('app.directives')
  .directive('track', track)
  ;

/* @ngInject */
function track(_, TemplateUrls) {
  return {
    scope: {
      track: '='
    },
    replace: true,
    restrict: 'E',
    templateUrl: TemplateUrls.TRACK,
    controller: controller
  };

  /* @ngInject */
  function controller($scope, $timeout) {
    $scope.onToggle = onToggle;

    if ($scope.track.nextRace.Status.toLowerCase() === 'closed') {
      $scope.track.softHide = true;
    }

    const hasActiveRaces = !!_($scope.track.races).values().value().find((r) =>
      r.id >= $scope.track.nextRace.RaceNum + ($scope.track.nextRace.RaceStatus.toLowerCase() !== 'off' ? -1 : 0)
    );

    if (!hasActiveRaces) {
      $scope.track.softHide = true;
    }

    function onToggle(track) {
      if (track.hideTO) {
        $timeout.cancel(track.hideTO);
      }

      track.hideTO = $timeout(function() {
        console.debug(`Setting hide to undefined.`, track); // eslint-disable-line

        track.hide = undefined;
      }, 1000 * 60 * 5);

      return true;
    }
  }
}

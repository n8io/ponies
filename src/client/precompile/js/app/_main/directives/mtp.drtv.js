(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('mtp', mtp)
    ;

  /* @ngInject */
  function mtp() {
    return {
      scope: {
        mtp: '='
      },
      replace: true,
      restrict: 'E',
      template: `
        <div class='mtp-container'>
          <div class='mtp-wrapper'
            data-ng-if='mtp.RaceStatus.toLowerCase() == "open"'
            data-ng-class='{`
            + `"not-soon": mtp.Mtp >= 9,`
            + `"kinda-soon": mtp.Mtp >= 7 && mtp.Mtp <= 8,`
            + `"fairly-soon": mtp.Mtp >= 5 && mtp.Mtp <= 7,`
            + `"soon": mtp.Mtp >= 3 && mtp.Mtp <= 4,`
            + `"very-soon": mtp.Mtp >= 1 && mtp.Mtp <= 2,`
            + `"now": mtp.Mtp == 0 && mtp.RaceStatus.toLowerCase() != "off"`
            + `}'
            data-ng-bind='"R" + mtp.RaceNum  + " MTP " + mtp.Mtp'
            >
          </div>
          <div class='mtp-wrapper off'
            data-ng-if='mtp.RaceStatus.toLowerCase() == "off"'
            >
            <span data-ng-bind='"R" + mtp.RaceNum  + " OFF"'></span>
            <i class='fa fa-lock'></i>
          </div>
          <div class='mtp-wrapper closed'
            data-ng-if='mtp.Status.toLowerCase() == "closed"'
            data-ng-bind='"FINISHED"'
            >
          </div>
        </div>
      `
    };
  }
})();

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
            data-ng-class='{`
            + `"closed": mtp.Status.toLowerCase() == "closed",`
            + `"not-soon": mtp.Status.toLowerCase() == "open" && mtp.Mtp >= 9,`
            + `"kinda-soon": mtp.Status.toLowerCase() == "open" && mtp.Mtp >= 7 && mtp.Mtp <= 8,`
            + `"fairly-soon": mtp.Status.toLowerCase() == "open" && mtp.Mtp >= 5 && mtp.Mtp <= 7,`
            + `"soon": mtp.Status.toLowerCase() == "open" && mtp.Mtp >= 3 && mtp.Mtp <= 4,`
            + `"very-soon": mtp.Status.toLowerCase() == "open" && mtp.Mtp >= 1 && mtp.Mtp <= 2,`
            + `"now": mtp.Status.toLowerCase() == "open" && mtp.Mtp == 0 && mtp.RaceStatus.toLowerCase() != "off",`
            + `"off": mtp.Status.toLowerCase() == "open" && mtp.Mtp == 0 && mtp.RaceStatus.toLowerCase() == "off"`
            + `}'
            >
            <span data-ng-bind='mtp | mtpText'></span>
            <i data-ng-show='mtp.Mtp == 0 && mtp.RaceStatus.toLowerCase() == "off"' class='fa fa-lock'></i>
          </div>
        </div>
      `
    };
  }
})();

(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('presence', presence)
    ;

  /* @ngInject */
  function presence() {
    return {
      scope: {
        presences: '=',
        me: '=myPresence'
      },
      template: `
      <div class='presence-container' data-ng-show='presences.length > 0'>
        <div class='presence-wrapper' data-ng-repeat='p in presences | orderBy:["-isSyncing", "-firstName", "lastName"]' `
          + `data-ng-hide='p.email == me.email'>
          <div class='presence' data-ng-class='{syncing: !!p.isSyncing}'>
            <gravatar email='p.email' size='50' round title='{{p.firstName ? p.firstName + " " + p.lastName + " is " + (p.isSyncing ? "" : "not ")`
              + ` + "syncing" : ""}}' default='identicon' letter='p.firstName'></gravatar>
          </div>
        </div>
      </div>
      `,
      replace: true,
      restrict: 'E'
    };
  }
})();

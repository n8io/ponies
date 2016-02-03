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
        presences: '='
      },
      template: `
      <div class='presence-container' data-ng-show='presences.length > 0'>
        <div class='presence-wrapper' data-ng-repeat='p in presences | orderBy:["isSyncing", "-firstName", "lastName"]'>
          <div class='presence' data-ng-class='{syncing: p.isSyncing}'>
            <gravatar email='p.email' size='50' round title='{{p.firstName + " " + p.lastName + " is " + (p.isSyncing ? "" : "not ") + "syncing"}}' default='http://google.com/broken-image.jpg' letter='p.firstName'></gravatar>
          </div>
        </div>
      </div>
      `,
      replace: true,
      restrict: 'E'
    };
  }
})();

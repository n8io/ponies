(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('syncStatus', syncStatus)
    ;

  /* @ngInject */
  function syncStatus() {
    return {
      scope: {
        status: '='
      },
      template: `<div class='sync-status' data-ng-class='{ on: status, off: !status }' />`,
      replace: true,
      restrict: 'E'
    };
  }
})();

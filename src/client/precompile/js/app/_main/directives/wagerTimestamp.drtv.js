(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wagerTimestamp', wagerTimestamp)
    ;

  /* @ngInject */
  function wagerTimestamp() {
    return {
      scope: {
        wager: '='
      },
      restrict: 'E',
      template: `
        <div class='wager-timestamp-container cursor-pointer' data-ng-click='wager.showActualTime = !wager.showActualTime'>
          <div data-ng-show='!wager.showActualTime' class='wager-timestamp-window'>
            <div class='wager-timestamp-ago ts' value='{{wager.timestamp}}'>{{wager.timestamp | ago}}</div>
            <div class='wager-timestamp-value'>{{wager.timestamp | date:'mediumTime'}}</div>
          </div>
          <div data-ng-show='wager.showActualTime' class='wager-timestamp-id'>#{{wager.id}}</div>
        </div>
      `
    };
  }
})();

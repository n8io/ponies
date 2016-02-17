/* eslint-disable */
(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('wager', wager)
    ;

  /* @ngInject */
  function wager() {
    return {
      scope: {
        wager: '='
      },
      template: `
      <div
        class='wager-wrapper'
        data-ng-class='{`
          + `won: wager.status == "PAID" && wager.payoutAmount > 0,`
          + `lost: wager.status == "PAID" && wager.payoutAmount == 0,`
          + `pending: wager.status == "PLACED",`
          + `canceled: wager.status == "CANCELED"}`
        + `'>
        <gravatar
          email='wager.user.email'
          size='20'
          round=''
          title='{{wager.user.firstName + " " + wager.user.lastName}}'
          default='identicon'
          letter='wager.user.firstName'>
        </gravatar>
        <span class='wager-type hide-xs' data-ng-bind='wager.poolTypeName'></span>
        <span class='wager-type hide-sm hide-md hide-lg hide-xl' data-ng-bind='wager.poolType'></span>
        <span class='wager-selections' data-ng-bind='wager.selections'></span>
        <span class='wager-amount'
          data-ng-if='wager.status != "PAID" && wager.status != "CANCELED"'
          data-ng-bind='wager.betAmount | currency:"$":2'>
        </span>
        <span class='wager-payout loser'
          data-ng-show='wager.payoutAmount === 0'
          data-ng-if='wager.status == "PAID"'
          data-ng-bind='wager.betAmount | currency:"$":2'>
        </span>
        <span class='wager-payout winner'
          data-ng-show='wager.payoutAmount > 0'
          data-ng-bind='(wager.betAmount | currency:"$":2) + "/" + (wager.payoutAmount | currency:"$":2)'>
        </span>
        </span>
        <span class='wager-refund'
          data-ng-if='wager.status == "CANCELED"'
          data-ng-bind='wager.betAmount | currency:"$":2'>
        </span>
        <div class='float-right'>
          <wager-timestamp wager='wager' class='hide-xs' />
        </div>
      </div>
      `,
      replace: true,
      restrict: 'E'
    };
  }
})();

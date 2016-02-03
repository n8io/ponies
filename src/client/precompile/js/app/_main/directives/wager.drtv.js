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
          default='//www.google.com/broken.jpg'
          letter='wager.user.firstName'>
        </gravatar>
        <span class='wager-type' data-ng-bind='wager.type.Name'></span>
        <span class='wager-selections' data-ng-bind='wager.selections | selections'></span>
        <span class='wager-amount'
          data-ng-if='wager.status != "PAID" && wager.status != "CANCELED"'
          data-ng-bind='wager.betAmount | currency:"$":2'>
        </span>
        <span class='wager-payout'
          data-ng-class='{winner: wager.payoutAmount > 0, loser: wager.status == "PAID" && wager.payoutAmount == 0}'
          data-ng-if='wager.status == "PAID" && wager.status != "CANCELED"'
          data-ng-bind='wager.payoutAmount || wager.betAmount | currency:"$":2'>
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

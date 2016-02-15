(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('raceWinningWagers', raceWinningWagers)
    ;

  /* @ngInject */
  function raceWinningWagers() {
    return function(wagers) {
      if (!wagers.length) {
        return 0;
      }

      return wagers.filter(function(w) {
        return w.payoutAmount && w.payoutAmount > 0;
      });
    };
  }
})();

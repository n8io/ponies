(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('raceWinningWagers', raceWinningWagers)
    ;

  /* @ngInject */
  function raceWinningWagers() {
    return function(race) {
      if (!race || !race.wagers || !race.wagers.length) {
        return 0;
      }

      return race.wagers.filter(function(w) {
        return w.payoutAmount && w.payoutAmount > 0;
      });
    };
  }
})();

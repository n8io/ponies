(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('toTrackArray', toTrackArray)
    ;

  /* @ngInject */
  function toTrackArray() {
    return function(obj) {
      return _(obj).values().filter((o) => o && o.nextRace).value();
    };
  }
})();

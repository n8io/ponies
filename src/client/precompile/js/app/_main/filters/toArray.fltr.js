(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('toArray', toArray)
    ;

  /* @ngInject */
  function toArray() {
    return function(obj) {
      return _(obj).values().filter((o) => o && o.nextRace).value();
    };
  }
})();

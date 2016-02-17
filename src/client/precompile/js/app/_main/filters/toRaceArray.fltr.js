(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('toRaceArray', toRaceArray)
    ;

  /* @ngInject */
  function toRaceArray() {
    return function(obj) {
      return _(obj).values().filter((o) => o && o.id).value();
    };
  }
})();

(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('toWagerArray', toWagerArray)
    ;

  /* @ngInject */
  function toWagerArray() {
    return function(obj) {
      return _(obj).values().filter((o) => {
        return o && o.id;
      }).value();
    };
  }
})();

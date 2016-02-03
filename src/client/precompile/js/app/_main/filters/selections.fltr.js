(function() {
  'use strict';

  angular
    .module('app.filters')
    .filter('selections', selections)
    ;

  /* @ngInject */
  function selections() {
    return function(wps) {
      const reg = /(,WT,)/ig;

      return (wps || '').replace(reg, '/');
    };
  }
})();

(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('Mousetrap', mousetrap)
    ;

  /* @ngInject */
  function mousetrap() {
    return Mousetrap; // eslint-disable-line
  }
})();

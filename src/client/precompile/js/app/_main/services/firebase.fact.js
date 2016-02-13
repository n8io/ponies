(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('Firebase', firebaseService)
    ;

  /* @ngInject */
  function firebaseService() {
    return Firebase; // eslint-disable-line
  }
})();

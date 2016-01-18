(function() {
  'use strict';

  angular
    .module('app.services')
    .factory('socketIoService', socketIoService)
    ;

  /* @ngInject */
  function socketIoService($rootScope) {
    const socket = io.connect(); // eslint-disable-line

    return {
      on: on,
      emit: emit
    };

    function on(eventName, callback) {
      socket.on(eventName, function() {
        const args = arguments;

        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    }

    function emit(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        const args = arguments;

        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  }
})();

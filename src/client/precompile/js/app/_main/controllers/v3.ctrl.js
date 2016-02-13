(function() {
  'use strict';

  angular
    .module('app.controllers')
    .controller('V3Controller', v3Controller)
    ;

  /* @ngInject */
  function v3Controller($firebaseArray, moment, Firebase, ConfigService) {
    const vm = this; // eslint-disable-line
    let config;

    vm.tracks = [];

    activate();

    function activate() {
      ConfigService
        .get()
        .then((configData) => {
          config = configData;

          return initFirebase(config.firebase.baseUri);
        })
        .then((tracks) => {
          console.debug(`Tracks data loaded.`, tracks); // eslint-disable-line

          return;
        })
        .then(() => {
          vm.tracks.$add({
            BrisCode: 'TAM'
          });
        })
        ;
    }

    function initFirebase(baseUri) {
      const ref = new Firebase(`${baseUri}/${getDataKey()}`);

      console.debug(`Fetching initial tracks data...`); // eslint-disable-line

      vm.tracks = $firebaseArray(ref);

      return new Promise((resolve, reject) => {
        vm.tracks
          .$loaded()
          .then(resolve)
          .catch(reject)
          ;
      });
    }

    function getDataKey() {
      const date = moment.utc().format(`YYYYMMDD`);

      return `track-day-${date}`;
    }
  }
})();

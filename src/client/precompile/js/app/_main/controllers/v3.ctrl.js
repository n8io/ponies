(function() {
  'use strict';

  angular
    .module('app.controllers')
    .controller('V3Controller', v3Controller)
    ;

  /* @ngInject */
  function v3Controller($timeout, $location, $firebaseObject, EnumService, moment, PubNub, Firebase, ConfigService) {
    const vm = this; // eslint-disable-line
    const channels = EnumService.PubNub.Channels;
    let config;
    let pubNub;

    vm.tracks = [];

    activate();

    function activate() {
      ConfigService
        .get()
        .then((configData) => {
          config = configData;

          return initFirebase(config.firebase.baseUri);
        })
        .then(() => {
          return new Promise((resolve) => {
            const pNub = PubNub.init({
              'subscribe_key': config.pubNub.subscribeKey,
              ssl: $location.protocol().indexOf('s') > -1,
              uuid: config.user.email
            });

            $timeout(() => {
              return resolve(pNub);
            }, 1000);
          });
        })
        .then((pubNubInstance) => {
          pubNub = pubNubInstance;

          return new Promise(function(resolve) {
            pubNub.subscribe({
              channel: channels.WAGERS,
              heartbeat: 60,
              message: angular.noop,
              presence: onPresenceStateChange,
              // state: mapToUserInfo(cfg.user),
              connect: function() {
                console.debug(`Now subscribed to ${channels.WAGERS} channel.`); // eslint-disable-line

                return resolve();
              }
            });

            vm.subscribe = true;
          });
        })
        .then((tracks) => {
          console.debug(`Tracks data loaded.`, tracks); // eslint-disable-line

          return;
        })
        ;
    }

    function initFirebase(baseUri) {
      const uri = `${baseUri}/trackDays/${getTodaysTrackDayKey()}`;
      const ref = new Firebase(uri);

      console.debug(`Fetching initial tracks data...`, uri); // eslint-disable-line

      return new Promise((resolve) => {
        vm.tracks = $firebaseObject(ref);

        vm.tracks.$loaded()
          .then((tracks) => {
            processTrackDayView(tracks);
            return resolve();
          })
          .catch(function(error) {
            console.error(`Error`, error); // eslint-disable-line
          })
          ;
      });
    }

    function onPresenceStateChange(ev) {
      console.debug('Presence state change event received...', ev); // eslint-disable-line
    }

    function processTrackDayView(tracks) {
      tracks.forEach((t) => {
        t.softHide = !hasActiveWagers(t);
      });
    }

    function hasActiveWagers(track) {
      if (!track || !track.races || !track.races.length || !track.nextRace || track.nextRace.Status.toLowerCase() === 'closed') {
        return false;
      }

      const currentRaceId = track.nextRace.RaceStatus.toLowerCase() === 'off' ? track.nextRace.RaceNum : track.nextRace.RaceNum - 1;

      return !!track.races.find(function(r) {
        return currentRaceId <= r.id;
      });
    }

    function getTodaysTrackDayKey(localDate) {
      const now = moment(localDate).utc();
      const nowHour = now.hour();

      if (nowHour < 7 || (nowHour >= 7 && nowHour <= 10)) { // After 2AM ET and before 6AM ET (off hours)
        now.add(-1, 'd'); // Previous day
      }

      return `${now.format(`YYYYMMDD`)}`;
    }
  }
})();

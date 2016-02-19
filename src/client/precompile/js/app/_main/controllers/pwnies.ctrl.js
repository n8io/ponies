angular
  .module('app.controllers')
  .controller('PwniesController', pwniesController)
  ;

/* @ngInject */
function pwniesController($timeout, $location, _, $firebaseObject, moment, PubNub, Firebase, EnumService, ConfigService) {
  const vm = this; // eslint-disable-line
  const channels = EnumService.PubNub.Channels;
  let config;
  let pubNub;
  let isLoading = true;

  vm.presences = [];

  activate();

  function activate() {
    ConfigService
      .get()
      .then((configData) => {
        config = configData;

        return initFirebase(config.firebase.baseUri);
      })
      .then(() =>
        new Promise((resolve) => {
          const pNub = PubNub.init({
            'subscribe_key': config.pubNub.subscribeKey,
            ssl: $location.protocol().indexOf('s') > -1,
            uuid: config.user.email
          });

          $timeout(() => resolve(pNub), 2000);
        })
      )
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
      .then(() =>
        new Promise(function(resolve) {
          pubNub.here_now({
            channel: channels.WAGERS,
            state: true,
            callback: (data) => {
              onHereNowReceived(data);

              return resolve();
            }
          });

          vm.subscribe = true;
        })
      )
      .then((tracks) => {
        console.debug(`Tracks data loaded.`, tracks); // eslint-disable-line

        isLoading = false;

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

  function onHereNowReceived(data) {
    console.debug('Here now data received...', data); // eslint-disable-line

    const peeps = data
        .uuids
        .map(mapToUserInfo)
        ;

    $timeout(() => {
      vm.presences = peeps;
    });
  }

  function onPresenceStateChange(ev) {
    if (isLoading) {
      return;
    }

    const supportedActions = {
      STATE_CHANGE: 'state-change',
      JOIN: 'join',
      LEAVE: 'leave',
      TIMEOUT: 'timeout'
    };

    console.debug('Presence state change event received...', ev); // eslint-disable-line

    switch (ev.action) {
      case supportedActions.JOIN:
        pubNub.here_now({
          channel: channels.WAGERS,
          state: true,
          callback: onHereNowReceived
        });
        break;
      case supportedActions.LEAVE:
      case supportedActions.TIMEOUT:
        pubNub.here_now({
          channel: channels.WAGERS,
          state: true,
          callback: onHereNowReceived
        });
        break;
      case supportedActions.STATE_CHANGE:
        $timeout(() => {
          vm.presences.forEach((p) => {
            if (p.email === ev.uuid) {
              p.isSyncing = !!ev.data.isSyncing;
            }
          });
        });
        break;
      default:
        break;
    }
  }

  function processTrackDayView(tracks) {
    tracks.forEach((t) => {
      t.softHide = !hasActiveWagers(t);
    });
  }

  function hasActiveWagers(track) {
    if (!track || !track.races || !track.nextRace || (track.nextRace.Status.toLowerCase() === 'closed' && track.nextRace.RaceStatus.toLowerCase() !== 'off')) {
      console.debug(`Track ${track.BrisCode} does not have active races/wagers`); // eslint-disable-line

      return false;
    }

    const currentRaceId = track.nextRace.RaceStatus.toLowerCase() === 'off' ? track.nextRace.RaceNum : track.nextRace.RaceNum - 1;

    return !!_(track.races).values().value().find(function(r) {
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

  function mapToUserInfo(user) {
    let data;
    let state = {};

    if (!user) {
      user = config.user;
    }

    state = user.data || user.state || {};

    data = {
      email: state.email || user.uuid || user.email,
      firstName: state.firstName || user.firstName || user.givenName || undefined,
      lastName: state.lastName || user.lastName || user.surname || undefined,
      isSyncing: angular.isDefined(state.isSyncing) ? state.isSyncing : undefined
    };

    data.fullName = state.fullName || undefined;

    if (!data.fullName && data.firstName && data.lastName) {
      data.fullName = `${data.firstName} ${data.lastName}`;
    }

    if (data.email === config.user.email) {
      data = Object.assign({}, config.user, data);
    }

    return data;
  }
}

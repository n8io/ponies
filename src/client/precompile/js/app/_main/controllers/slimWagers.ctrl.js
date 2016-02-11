(function() {
  'use strict';

  angular
    .module('app')
    .controller('SlimWagersController', slimWagersController)
    ;

  function slimWagersController($timeout, $interval, $location, toastr, EnumService, ConfigService, PubNub) {
    const vm = this; // eslint-disable-line
    const channels = EnumService.PubNub.Channels;
    const emailRegEx = /^(?!.{253,})[\w'-]+(?:\.[\w'-]+)*(?:\+[\w'-]+(\.[\w'-]+)*)?@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/ig;
    let isLoading = true;
    let pNub = null;
    let cfg = null;

    init();

    function init() {
      vm.tracks = [];
      vm.slimTracks = [];
      vm.presences = [];
      vm.me = {isSyncing: undefined};

      ConfigService
        .getConfig()
        .then(function(configData) {
          cfg = configData;

          return PubNub.init({
            'subscribe_key': cfg.pubNub.subscribeKey,
            ssl: $location.protocol().indexOf('s') > -1,
            uuid: cfg.user.email
          });
        })
        .then(function(pnInstance) { // Subscribe to wagers channel
          pNub = pnInstance;

          $(window).bind('unload',function() { // eslint-disable-line
            pNub.unsubscribe({
              channel: channels.WAGERS
            });
          });

          return new Promise(function(resolve) {
            pNub.subscribe({
              channel: channels.WAGERS,
              heartbeat: 60,
              message: onMessageReceived,
              presence: onPresenceEventReceived,
              state: mapToUserInfo(cfg.user),
              connect: function() {
                console.debug(`Now subscribed to ${channels.WAGERS} channel.`); // eslint-disable-line

                return resolve();
              }
            });

            vm.subscribe = true;
          });
        })
        .then(function() { // Get here now information
          isLoading = false;

          return new Promise(function(resolve, reject) {
            pNub.here_now({
              channel: channels.WAGERS,
              state: true,
              callback: function(data) {
                console.debug(`Here now data received...`, data); // eslint-disable-line

                return resolve(data);
              },
              error: function(err) {
                return reject(err);
              }
            });
          });
        })
        .then(function(data) {
          onHereNowReceived(data);
          startHereNowInterval();
        })
        .then(function() {
          console.info(`Finished PubNub initialization.`); // eslint-disable-line
        })
        ;
    }

    function onMessageReceived(message) { // eslint-disable-line
      // console.debug(`Message received...`, message); // eslint-disable-line

      if (message.trackResults) {
        return $timeout(function() {
          console.debug(`Track results received...`, message.trackResults); // eslint-disable-line

          processTrackResults(message.trackResults);
        });
      }
      else if (message.wagers) {
        return $timeout(function() {
          console.debug(`Wagers received...`, message.wagers); // eslint-disable-line

          processWagers(message.wagers);
        });
      }
    }

    function processTrackResults(trackResults) {
      trackResults.forEach(processTrackResult);
    }

    function processTrackResult(trackResult) {
      const foundTrack = vm.tracks.find(function(t) {
        return t.BrisCode === trackResult.track.BrisCode;
      });

      if (!foundTrack) {
        vm.tracks.push(getNewTrackFromTrackResult(trackResult));

        return;
      }

      vm.tracks.forEach(function(t) {
        if (t.BrisCode !== foundTrack.BrisCode) {
          return;
        }

        t.nextRace = trackResult.track.nextRace;

        if ((t.nextRace.Status || '').toLowerCase() === 'closed') {
          t.softHide = true;
        }

        t.races.forEach(function(cr) {
          const foundResultRace = trackResult.races.find(function(rr) {
            return cr.id === rr.id;
          });

          if (foundResultRace) {
            Object.assign(cr, foundResultRace);
          }

          if (t.nextRace.RaceNum - 1 > cr.id || (t.nextRace && t.nextRace.Status.toLowerCase() === 'closed')) {
            cr.softHide = true;
          }
        });

        trackResult.races.forEach(function(tr) {
          const foundCurrentRace = t.races.find(function(cr) {
            return tr.id === cr.id;
          });

          if (!foundCurrentRace) {
            if (t.nextRace.RaceNum - 1 > tr.id || (t.nextRace && t.nextRace.Status.toLowerCase() === 'closed')) {
              tr.softHide = true;
            }

            t.races.push(tr);
          }
        });

        t.softHide = !hasActiveWagers(t);
      });
    }

    function processWagers(wagers) {
      vm.tracks.forEach(function(t) {
        const foundWagers = wagers.filter(function(w) {
          return w.track.BrisCode === t.BrisCode;
        });

        if (!foundWagers.length) {
          return; // No wagers found for this track, exit
        }

        foundWagers.forEach(function(fw) {
          const foundRace = t.races.find(function(r) {
            return fw.race.id === r.id;
          });

          if (foundRace) {
            if (t.nextRace.RaceNum - 1 > foundRace.id || t.nextRace.Status.toLowerCase() === 'closed') {
              foundRace.softHide = true;
            }

            const foundWager = (foundRace.wagers || []).find(function(w) {
              return w.id === fw.id;
            });

            if (foundWager) {
              Object.assign(foundWager, fw);
            }
            else { // No wager found, add it to race
              if (!foundRace.wagers) {
                foundRace.wagers = [];
              }

              foundRace.wagers.push(slimWager(fw));
            }
          }
          else { // No race found, add it to track with wager
            if (!t.races) {
              t.races = [];
            }

            const race = getNewRaceFromWager(fw);

            if (t.nextRace.RaceNum - 1 > race.id || t.nextRace.Status.toLowerCase() === 'closed') {
              race.softHide = true;
            }

            t.races.push(race);
          }
        });

        t.softHide = !hasActiveWagers(t);
      });
    }

    function onPresenceEventReceived(ev) { // eslint-disable-line
      console.debug(`Presence state changed`, ev); // eslint-disable-line

      if (!emailRegEx.test(ev.uuid)) {
        return; // Not a valid dude, skip
      }

      switch (ev.action) {
        case 'state-change':
          return onPresenceStateChange(ev);
        // case 'join':
        //   return onPresenceJoin(ev);
        // case 'leave':
        //   return onPresenceLeave(ev);
        default:
          break;
      }
    }

    function onHereNowReceived(data) { // eslint-disable-line
      $timeout(function() {
        const peeps = data
          .uuids
          .map(mapToUserInfo)
          ;

        vm.presences = peeps;
      });
    }

    function onPresenceStateChange(ev) {
      console.debug('Presence state change event received...', ev); // eslint-disable-line

      updateSyncState(mapToUserInfo(ev));
    }

    function startHereNowInterval() {
      $interval(function() {
        pNub.here_now({
          channel: channels.WAGERS,
          state: true,
          callback: onHereNowReceived
        });
      }, 5000);
    }

    function getNewTrackFromTrackResult(trackResult) {
      let data = {}; // eslint-disable-line

      Object.assign(data, trackResult.track, {races: []});

      return data;
    }

    function getNewRaceFromWager(wager) {
      return {
        id: wager.race.id,
        wagers: [slimWager(wager)]
      };
    }

    function slimWager(wager) {
      return wager;
      // return _.omit(wager, [
      //   'track'
      // ]);
    }

    function updateSyncState(user) {
      $timeout(function() {
        const foundPresence = vm.presences.find(function(p) {
          return p.email === user.email;
        });

        let before = foundPresence ? foundPresence.isSyncing : undefined;

        if (!foundPresence) {
          return;
        }

        vm.presences = vm.presences.map(function(p) {
          if (p.email === user.email) {
            before = !!p.isSyncing;
            p = user;
          }

          return p;
        });

        if (!isLoading && before !== user.isSyncing) {
          // showSyncToast(user);
        }
      });
    }

    function mapToUserInfo(user) {
      let data;
      let state = {};

      if (!user) {
        user = cfg.user;
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

      if (data.email === cfg.user.email) {
        data = Object.assign({}, cfg.user, data);
      }

      return data;
    }

    function hasActiveWagers(track) {
      if (!track || !track.races || !track.races.length || !track.nextRace || track.nextRace.Status.toLowerCase() === 'closed') {
        return false;
      }

      return track.races.find(function(r) {
        return r.id >= track.nextRace.RaceNum - (track.nextRace.RaceStatus.toLowerCase() === 'off' ? 0 : 1) && r.wagers && r.wagers.length;
      });
    }
  }
})();

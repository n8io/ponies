(function() {
  'use strict';

  angular
    .module('app')
    .controller('SlimWagersController', slimWagersController)
    ;

  function slimWagersController($timeout, $location, toastr, ngNotify, EnumService, ConfigService, PubNub) {
    const vm = this; // eslint-disable-line
    const channels = EnumService.PubNub.Channels;
    let isLoading = true;
    let pNub = null;
    let userInfo = null;

    init();

    function init() {
      vm.tracks = [];
      vm.slimTracks = [];
      vm.presences = [];
      vm.hasOldRaces = hasOldRaces;
      vm.me = {isSyncing: undefined};

      ConfigService
        .getConfig()
        .then(function(res) {
          vm.userInfo = userInfo = res.data.user;

          return PubNub.init({
            'subscribe_key': res.data.pubNub.subscribeKey,
            ssl: $location.protocol().indexOf('s') > -1,
            uuid: userInfo.email
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
              state: mapToUserInfo(userInfo),
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
        })
        .finally(function() {
          console.info(`Finished PubNub initialization.`); // eslint-disable-line
        })
        ;
    }

    function onMessageReceived(message) { // eslint-disable-line
      // console.debug(`Message received...`, message); // eslint-disable-line

      if (message.trackResult) {
        return $timeout(function() {
          console.debug(`Track result received ${message.trackResult.track.BrisCode}...`, message.trackResult); // eslint-disable-line

          processTrackResult(message.trackResult);
        });
      }
      else if (message.wagers) {
        return $timeout(function() {
          console.debug(`Wagers received...`, message.wagers); // eslint-disable-line

          processWagers(message.wagers);
        });
      }
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

          if (t.nextRace.RaceNum - 1 > cr.id) {
            cr.softHide = true;
          }
        });

        trackResult.races.forEach(function(tr) {
          const foundCurrentRace = t.races.find(function(cr) {
            return tr.id === cr.id;
          });

          if (!foundCurrentRace) {
            if (t.nextRace.RaceNum - 1 > tr.id) {
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
            if (t.nextRace.RaceNum - 1 > foundRace.id) {
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

            if (t.nextRace.RaceNum - 1 > race.id) {
              race.softHide = true;
            }

            t.races.push(race);
          }
        });

        t.softHide = !hasActiveWagers(t);
      });
    }

    function onPresenceEventReceived(ev) { // eslint-disable-line
      switch (ev.action) {
        case 'state-change':
          return onPresenceStateChange(ev);
        case 'join':
          return onPresenceJoin(ev);
        case 'leave':
          return onPresenceLeave(ev);
        default:
          break;
      }
    }

    function onHereNowReceived(data) { // eslint-disable-line
      data.uuids.forEach(function(uuid) {
        updatePresences(uuid);
      });
    }

    function onPresenceJoin(ev) {
      console.debug('Presence join event received...', ev); // eslint-disable-line

      if (ev.uuid === userInfo.email) {
        // Ignore, it's just me
        console.debug(`Ignoring because it is just me joining the channel.`); // eslint-disable-line

        return;
      }

      $timeout(function() {
        updatePresences(ev);
      });
    }

    function onPresenceLeave(ev) {
      console.debug('Presence leave event received...', ev); // eslint-disable-line

      $timeout(function() {
        updatePresences(ev);
      });
    }

    function onPresenceStateChange(ev) {
      console.debug('Presence state change event received...', ev); // eslint-disable-line

      $timeout(function() {
        updatePresences(ev);
      });
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

    function updatePresences(ev) {
      const foundPresence = vm.presences.find(function(p) {
        return p.email === ev.uuid;
      });
      const user = mapToUserInfo(ev);
      let before = foundPresence ? foundPresence.isSyncing : undefined;

      if (ev.action === 'leave') {
        vm.presences = vm.presences.filter(function(p) {
          return p.email !== ev.uuid;
        });

        return;
      }

      if (!foundPresence) {
        vm.presences.push(mapToUserInfo(ev));
      }
      else {
        vm.presences = vm.presences.map(function(p) {
          if (p.email === ev.uuid) {
            before = !!p.isSyncing;
            p = user;
          }

          return p;
        });
      }

      if (!isLoading && before !== user.isSyncing) {
        showSyncToast(user);
      }
    }

    function showSyncToast(user) {
      let msg = ``;

      if (!user || !user.firstName) {
        return;
      }

      if (user.email === userInfo.email) {
        msg = `You are ${user.isSyncing ? '' : 'not'} syncing`;
        vm.me.isSyncing = user.isSyncing;
      }
      else {
        msg = `${user.firstName} is ${user.isSyncing ? '' : 'not'} syncing`;
      }

      if (user.isSyncing) {
        toastr.success(msg);
      }
      else {
        toastr.error(msg);
      }
    }

    function mapToUserInfo(user) {
      let data;
      let state = {};

      if (!user) {
        user = userInfo;
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

      if (data.email === userInfo.email) {
        Object.assign(data, userInfo, data);
      }

      return data;
    }

    function hasActiveWagers(track) {
      if (!track || !track.races || !track.races.length) {
        return false;
      }

      return track.races.find(function(r) {
        return r.id >= track.nextRace.RaceNum - (track.nextRace.RaceStatus.toLowerCase() === 'off' ? 0 : 1) && r.wagers && r.wagers.length;
      });
    }

    function hasOldRaces(track) {
      if (!track || !track.races || !track.nextRace) {
        return false;
      }

      return !!track.races.find(function(r) {
        return r.id < track.nextRace.RaceNum - 1;
      });
    }
  }
})();

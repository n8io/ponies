(function() {
  'use strict';

  let userInfo;
  let pn;

  angular
    .module('app.controllers')
    .controller('MasterController', masterController)
    ;

  /* @ngInject */
  function masterController($interval, $timeout, $location, $rootScope, ngNotify, EnumService, ConfigService, PubNub) {
    const vm = this; // eslint-disable-line

    vm.tracks = [];
    vm.iAmSyncing = -1;
    vm.winnningWagers = winnningWagers;
    vm.trackSortOrder = trackSortOrder;
    vm.presences = [];

    init();

    function init() {
      const wagerChannel = EnumService.PUBNUB.CHANNELS.WAGER;
      const allWagersChannel = EnumService.PUBNUB.CHANNELS.ALL_WAGERS;
      const allResultsChannel = EnumService.PUBNUB.CHANNELS.ALL_RESULTS;
      const syncChannel = EnumService.PUBNUB.CHANNELS.SYNC;
      const historyStartTime = moment().toDate().getTime() * 10000; // eslint-disable-line
      const historyEndTime = moment().add(-20, 'm').toDate().getTime() * 10000; // eslint-disable-line

      console.log('historyStartTime',historyStartTime); // eslint-disable-line
      console.log('historyEndTime',historyEndTime); // eslint-disable-line

      ConfigService
        .getConfig()
        .then(function(res) {
          userInfo = res.data.user;

          return PubNub.init({
            'subscribe_key': res.data.pubNub.subscribeKey,
            ssl: $location.protocol().indexOf('s') > -1,
            uuid: userInfo.email
          });
        })
        .then(function(pnInstance) {
          pn = pnInstance;

          // Return history for playback
          return new Promise(function(resolve, reject) {
            pn.history({
              channel: allWagersChannel,
              count: 30,
              start: historyStartTime,
              end: historyEndTime,
              callback: function(data) {
                resolve(data[0]);
              },
              error: function(err) {
                reject(err);
              }
            });
          });
        })
        .then(function(wagerHistory) {
          // TODO: Process wager history
          console.debug('Past wagers loaded...', wagerHistory); // eslint-disable-line

          wagerHistory.forEach(onAllWagersReceived);

          // Get past results
          return new Promise(function(resolve, reject) {
            pn.history({
              channel: allResultsChannel,
              count: 10,
              start: historyStartTime,
              end: historyEndTime,
              callback: function(data) {
                resolve(data[0]);
              },
              error: function(err) {
                reject(err);
              }
            });
          });
        })
        .then(function(raceResultsHistory) {
          // TODO: Process race results history
          console.debug('Past race results loaded...', raceResultsHistory); // eslint-disable-line

          raceResultsHistory.forEach(onAllResultsReceived);

          pn.subscribe({
            channel: allWagersChannel,
            message: onAllWagersReceived
          });

          pn.subscribe({
            channel: allResultsChannel,
            message: onAllResultsReceived
          });

          pn.subscribe({
            channel: wagerChannel,
            message: onWagerReceived,
            presence: onPresenceEvent,
            state: userInfo,
            heartbeat: 120 // seconds
          });

          pn.here_now({
            channel: wagerChannel,
            state: true,
            callback: onHereNow
          });

          startTrackMinimizeTimeout();
        })
        .then(function() {
          pn.subscribe({
            channel: syncChannel,
            message: angular.noop,
            presence: onSyncPresenceEvent
          });

          pn.here_now({
            channel: syncChannel,
            state: true,
            callback: onHereNowSync
          });
        })
        ;

      function onWagerReceived(wager) {
        $timeout(function() {
          upsertWager(wager);
        });
      }

      function onAllWagersReceived(wagers) {
        $timeout(function() {
          upsertWagers(wagers);
        });
      }

      function onAllResultsReceived(results) {
        $timeout(function() {
          upsertResults(results);
        });
      }

      function onPresenceEvent(event /* presenceEvent, envelope, channel*/) {
        $timeout(function() {
          // apply presence event (join|leave) on users list
          handlePresenceEvent(event);
        });
      }

      function onSyncPresenceEvent(event /* presenceEvent, envelope, channel*/) {
        $timeout(function() {
          // apply presence event (join|leave) on users list
          handleSyncPresenceEvent(event);
        });
      }

      function onHereNow(data) {
        $timeout(function() {
          console.debug('Users in wager channel...', data); // eslint-disable-line

          data.uuids.forEach(function(id) {
            onUserJoin(id.state);
          });
        });
      }

      function onHereNowSync(data) {
        $timeout(function() {
          console.debug('Users in sync channel...', data); // eslint-disable-line

          data.uuids.forEach(function(id) {
            onUserSyncToggle(id.state);
          });
        });
      }
    }

    function startTrackMinimizeTimeout() {
      $timeout(collapseOldTracksAndRaces);

      function collapseOldTracksAndRaces() {
        vm.tracks = angular.copy(vm.tracks).map(function(t) {
          const liveRace = t.races.find(function(r) {
            const liveWager = r.wagers.find(function(w) {
              return w.status !== 'PAID' && w.status !== 'CANCELED';
            });

            return !!liveWager;
          });

          if (!liveRace) {
            t.hide = angular.isDefined(t.hide) ? t.hide : true;
          }
          else {
            t.hide = undefined;
          }

          t.races = angular.copy(t.races).map(function(r) {
            const liveWager = r.wagers.find(function(w) {
              return w.status !== 'PAID' && w.status !== 'CANCELED';
            });

            if (!liveWager) {
              r.hide = angular.isDefined(r.hide) ? r.hide : true;
            }
            else {
              r.hide = undefined;
            }

            return r;
          });

          return t;
        });
      }
    }

    function trackSortOrder(track) {
      let sort = '-0';

      if (!track || !track.mtp) {
        return '-1';
      }

      if (track.mtp.id === 99) {
        // FINISHED
        sort += '-999';
      }
      else if (track.mtp.mtp === 99) {
        // NOT STARTED
        sort += '-100';
      }
      else {
        sort += '-000';

        if ((track.races || []).length === 0) {
          sort += '-999';
        }

        if (track.races[track.races.length - 1].id < track.mtp.id) {
          sort += '-998';
        }
        else {
          // MTP
          const mtp = `-000${track.mtp.mtp}`;

          sort += `-${mtp.substr(mtp.length - 3)}`;
        }
      }

      return sort;
    }

    function upsertWagers(wagers) {
      wagers.forEach(function(w) {
        upsertWager(w);
      });

      startTrackMinimizeTimeout();
    }

    function upsertWager(wager) {
      let foundTrack;
      let foundRace;
      let foundWager;

      console.debug('Wager received...', wager); // eslint-disable-line

      foundTrack = vm.tracks.find(function(t) {
        return t.BrisCode === wager.track.BrisCode;
      });

      if (!foundTrack) {
        foundTrack = getNewTrackFromWager(wager);
        vm.tracks.push(foundTrack);

        return;
      }

      foundRace = (foundTrack.races || []).find(function(r) {
        return r.id === wager.race.id;
      });

      foundTrack.timestamp = foundTrack.timestamp < wager.timestamp ? wager.timestamp : foundTrack.timestamp;

      if (!foundRace) {
        foundTrack.races.push(getNewRaceFromWager(wager));

        return;
      }

      foundWager = (foundRace.wagers || []).find(function(w) {
        return w.id === wager.id;
      });

      foundRace.timestamp = foundRace.timestamp && foundRace.timestamp < wager.timestamp ? foundRace.timestamp : wager.timestamp;

      if (!foundWager) {
        foundRace.wagers.push(getNewWagerFromWager(wager));

        return;
      }
      else {
        foundRace.wagers = angular.copy(foundRace.wagers).map(function(w) {
          if (w.id === wager.id) {
            w = getNewWagerFromWager(wager);
          }

          return w;
        });
      }
    }

    function upsertResults(result) {
      console.debug('Race results received...', result); // eslint-disable-line

      const track = vm.tracks.find(function(t) {
        return t.BrisCode === result.BrisCode;
      });

      if (!track) {
        return;
      }

      track.mtp = result.mtp;

      (track.races || []).forEach(function(rc) {
        const race = result.races.find(function(r) {
          return rc.id === r.race;
        });

        if (race) {
          rc.result = `${race.win.horse}`;

          if (race.place) {
            rc.result += `/${race.place.horse}`;
          }

          if (race.show) {
            rc.result += `/${race.show.horse}`;
          }
        }
      });
    }

    function getNewTrackFromWager(wager) {
      const track = wager.track;

      track.timestamp = wager.timestamp;
      track.races = [getNewRaceFromWager(wager)];

      return track;
    }

    function getNewRaceFromWager(wager) {
      const race = wager.race;

      race.timestamp = wager.timestamp;
      race.wagers = [getNewWagerFromWager(wager)];

      return race;
    }

    function getNewWagerFromWager(wager) {
      return {
        timestamp: wager.timestamp,
        id: wager.id,
        email: wager.user.email,
        amount: wager.betAmount,
        type: wager.type,
        selections: wager.selections,
        eventCode: wager.eventCode,
        status: wager.status,
        user: wager.user,
        payoutAmount: wager.payoutAmount,
        refundAmount: wager.refundAmount
      };
    }

    function winnningWagers(race) {
      if (!race || !race.wagers) {
        return [];
      }

      const winningWagers = race.wagers.filter(function(w) {
        return w.payoutAmount > 0;
      });

      return winningWagers;
    }

    function handlePresenceEvent(ev) {
      // console.info('Event', ev); // eslint-disable-line
      // console.debug('Presence event', presenceEvent); // eslint-disable-line

      if (!ev.action || !ev.data) {
        return; // Do nothing
      }

      switch (ev.action) {
        case 'join':
          console.debug('User joined wager channel....', ev.data); // eslint-disable-line

          onUserJoin(ev.data);
          break;
        case 'leave':
        case 'timeout':
          console.debug('User left wager channel....', ev.data); // eslint-disable-line

          onUserLeave(ev.data);
          break;
        default:
          break;
      }
    }

    function onUserJoin(user) {
      let foundPresence = null;

      if (!isUserValid(user) || user.email === userInfo.email) {
        return;
      }

      foundPresence = angular.copy(vm.presences).find(function(p) {
        return p.email === user.email;
      });

      if (!foundPresence) {
        vm.presences.push(user);
      }
      else {
        return;
      }
    }

    function onUserLeave(user) {
      vm.presences = vm.presences.filter(function(p) {
        return p.email !== user.email;
      });
    }

    function handleSyncPresenceEvent(ev) {
      // console.info('Sync presence event received...', ev); // eslint-disable-line
      // console.debug('Presence event', presenceEvent); // eslint-disable-line

      if (!ev.action || !ev.data) {
        return; // Do nothing
      }

      switch (ev.action) {
        case 'join':
        case 'leave':
        case 'timeout':
          break;
        case 'state-change':
          console.debug('State-change detected...', ev.data); // eslint-disable-line

          onUserSyncToggle(ev.data);
          break;
        default:
          break;
      }
    }

    function onUserSyncToggle(user) {
      let foundPresence = null;

      if (!isUserValid(user)) {
        return;
      }
      else if (user.email === userInfo.email) {
        if (user.isSyncing) {
          ngNotify.set('Syncing has been enabled', 'success');
        }
        else {
          ngNotify.set('Syncing has been disabled', 'error');
        }

        vm.iAmSyncing = !!user.isSyncing;

        return;
      }

      foundPresence = angular.copy(vm.presences).find(function(p) {
        return p.email === user.email;
      });

      if (!foundPresence) {
        user.isSyncing = true;

        onUserJoin(user);
      }
      else {
        vm.presences = angular.copy(vm.presences).map(function(p) {
          if (p.email === user.email) {
            p.isSyncing = user.isSyncing;
          }

          return p;
        });
      }
    }

    function isUserValid(user) {
      const isValid = true;

      if (!user) {
        return false;
      }
      else if (!user.email || (!(user.givenName && user.surname) && !(user.firstName && user.lastName))) {
        return false;
      }

      return isValid;
    }
  }
})();

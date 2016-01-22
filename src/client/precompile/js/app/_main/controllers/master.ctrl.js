(function() {
  'use strict';

  angular
    .module('app.controllers')
    .controller('MasterController', masterController)
    ;

  /* @ngInject */
  function masterController($timeout, $location, $rootScope, EnumService, socketIoService, PubNub) {
    const vm = this; // eslint-disable-line

    vm.tracks = [];

    init();

    function upsertWagers(wagers) {
      wagers.forEach(upsertWager);
    }

    function upsertWager(wager) {
      let foundTrack;
      let foundRace;
      let foundWager;

      console.debug('Wager received...', wager); // eslint-disable-line

      vm.tracks = vm.tracks || [];

      foundTrack = (vm.tracks || []).find(function(t) {
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

      foundTrack.timestamp = wager.timestamp;

      if (!foundRace) {
        foundTrack.races.push(getNewRaceFromWager(wager));

        return;
      }

      foundWager = (foundRace.wagers || []).find(function(w) {
        return w.id === wager.id;
      });

      foundRace.timestamp = wager.timestamp;

      if (!foundWager) {
        foundRace.wagers.push(getNewWagerFromWager(wager));

        return;
      }

      vm.tracks = vm.tracks.map(function(t) {
        if (t.name === foundTrack.name) {
          t = foundTrack;
        }

        return t;
      });
    }

    function upsertResults(result) {
      console.debug('Race results received...', result); // eslint-disable-line

      const track = vm.tracks.find(function(t) {
        return t.BrisCode === result.BrisCode;
      });

      (track.races || []).forEach(function(rc) {
        const race = result.races.find(function(r) {
          return rc.id === r.race;
        });

        rc.result = `${race.win.horse}/${race.place.horse}/${race.show.horse}`;
      });
    }

    function getNewTrackFromWager(wager) {
      const track = wager.track;

      track.timestamp = wager.timestamp || (new Date()).getTime();
      track.races = [getNewRaceFromWager(wager)];

      return track;
    }

    function getNewRaceFromWager(wager) {
      const race = wager.race;

      race.timestamp = wager.timestamp || (new Date()).getTime();
      race.wagers = [getNewWagerFromWager(wager)];

      return race;
    }

    function getNewWagerFromWager(wager) {
      return {
        timestamp: wager.timestamp,
        id: wager.id,
        email: wager.user.email,
        amount: wager.betAmount,
        amountDisplay: `$${wager.betAmount.toFixed(2)}`,
        type: wager.type,
        selections: wager.selections,
        eventCode: wager.eventCode,
        status: wager.status
      };
    }

    function init() {
      const wagerChannel = EnumService.PUBNUB.CHANNELS.WAGER;
      const wagerEventName = PubNub.ngMsgEv(wagerChannel);
      const allWagersChannel = EnumService.PUBNUB.CHANNELS.ALL_WAGERS;
      const allWagersEventName = PubNub.ngMsgEv(allWagersChannel);
      const allResultsChannel = EnumService.PUBNUB.CHANNELS.ALL_RESULTS;
      const allResultsEventName = PubNub.ngMsgEv(allResultsChannel);
      const presenceEventName = PubNub.ngPrsEv(wagerChannel);

      $rootScope.$on(wagerEventName, onWagerReceived); // eslint-disable-line
      $rootScope.$on(allWagersEventName, onAllWagersReceived); // eslint-disable-line
      $rootScope.$on(allResultsEventName, onAllResultsReceived); // eslint-disable-line
      $rootScope.$on(presenceEventName, onPresenceEvent); // eslint-disable-line

      PubNub.init({
        'subscribe_key': 'sub-c-2f1cbf66-be98-11e5-a9b2-02ee2ddab7fe',
        ssl: $location.protocol().indexOf('s') > -1
      });

      PubNub.ngSubscribe({
        channel: wagerChannel,
        triggerEvents: ['callback', 'presence']
      });

      PubNub.ngSubscribe({
        channel: allWagersChannel,
        triggerEvents: ['callback', 'presence']
      });

      PubNub.ngSubscribe({
        channel: allResultsChannel,
        triggerEvents: ['callback', 'presence']
      });

      function onWagerReceived(ngEvent, message /* , envelope, channel*/) {
        $timeout(function() {
          upsertWager(message.message);
        });
      }

      function onAllWagersReceived(ngEvent, message /* , envelope, channel*/) {
        $timeout(function() {
          upsertWagers(message.message);
        });
      }

      function onAllResultsReceived(ngEvent, message /* , envelope, channel*/) {
        $timeout(function() {
          upsertResults(message.message);
        });
      }

      function onPresenceEvent(ngEvent, presenceEvent /* , envelope, channel*/) {
        $timeout(function() {
          // apply presence event (join|leave) on users list
          handlePresenceEvent(presenceEvent);
        });
      }
    }

    function handlePresenceEvent(ev) {
      console.info('Presence event', ev); // eslint-disable-line
    }
  }
})();

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

    socketIoService.on('wager', onWagerReceived);

    init();

    function onWagerReceived(wager) {
      console.log(wager); // eslint-disable-line
      upsertWager(wager);
    }

    function upsertWager(wager) {
      let foundTrack;
      let foundRace;
      let foundWager;

      vm.tracks = vm.tracks || [];

      foundTrack = (vm.tracks || []).find(function(t) {
        return t.name === wager.track;
      });

      if (!foundTrack) {
        foundTrack = getNewTrackFromWager(wager);
        vm.tracks.push(foundTrack);

        return;
      }

      foundRace = (foundTrack.races || []).find(function(r) {
        return r.id.toString() === wager.race.toString();
      });

      if (!foundRace) {
        foundTrack.races.push(getNewRaceFromWager(wager));

        return;
      }

      foundWager = (foundRace.wagers || []).find(function(w) {
        return w.id === wager.id;
      });

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

      console.log('Wager received...', wager); // eslint-disable-line
    }

    function getNewTrackFromWager(wager) {
      return {
        name: wager.track,
        races: [getNewRaceFromWager(wager)]
      };
    }

    function getNewRaceFromWager(wager) {
      return {
        id: wager.race,
        wagers: [getNewWagerFromWager(wager)]
      };
    }

    function getNewWagerFromWager(wager) {
      return {
        id: wager.id,
        email: wager.email,
        amount: parseFloat(wager.amount, 10),
        amountDisplay: wager.amountDisplay,
        type: wager.type,
        selections: wager.selections,
        horses: wager.horses
      };
    }

    function init() {
      const pubnubChannelName = EnumService.PUBNUB.CHANNELS.WAGER;
      const messageEventName = PubNub.ngMsgEv(pubnubChannelName);
      const presenceEventName = PubNub.ngPrsEv(pubnubChannelName);

      $rootScope.$on(messageEventName, onMessageEvent); // eslint-disable-line
      $rootScope.$on(presenceEventName, onPresenceEvent); // eslint-disable-line

      PubNub.init({
        'subscribe_key': 'sub-c-2f1cbf66-be98-11e5-a9b2-02ee2ddab7fe',
        ssl: $location.protocol().indexOf('s') > -1
      });

      PubNub.ngSubscribe({
        channel: pubnubChannelName,
        triggerEvents: ['callback', 'presence']
      });

      function onMessageEvent(ngEvent, message /* , envelope, channel*/) {
        $timeout(function() {
          upsertWager(message.message);
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

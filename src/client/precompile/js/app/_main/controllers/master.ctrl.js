(function() {
  'use strict';

  angular
    .module('app.controllers')
    .controller('MasterController', masterController)
    ;

  /* @ngInject */
  function masterController(socketIoService) {
    const vm = this; // eslint-disable-line

    vm.tracks = [];

    socketIoService.on('wager', onWagerReceived);

    function onWagerReceived(wager) {
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
      }

      foundRace = (foundTrack.races || []).find(function(r) {
        return r.id.toString() === wager.race.toString();
      });

      if (!foundRace) {
        foundTrack.races = [getNewRaceFromWager(wager)];
      }

      foundWager = (foundRace.wagers || []).find(function(w) {
        return w.id === wager.id;
      });

      if (!foundWager) {
        foundRace.wagers.push(getNewWagerFromWager(wager));
      }

      vm.tracks = vm.tracks.map(function(t) {
        if (t.name === foundTrack.name) {
          t = foundTrack;
        }

        return t;
      });

      console.log(vm.tracks); // eslint-disable-line
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
  }
})();

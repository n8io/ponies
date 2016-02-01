(function() {
  'use strict';

  angular
    .module('app')
    .controller('SlimWagersController', slimWagersController)
    ;

  function slimWagersController($timeout, $location, ngNotify, EnumService, ConfigService, PubNub) {
    const vm = this; // eslint-disable-line
    let pNub = null;
    let userInfo = null;

    init();

    function init() {
      const channels = EnumService.PubNub.Channels;

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
        .then(function(pnInstance) { // Subscribe to wagers channel
          pNub = pnInstance;

          return new Promise(function(resolve) {
            pNub.subscribe({
              channel: channels.WAGERS,
              message: onWagersReceived,
              presence: onPresenceEventReceived,
              state: mapToUserInfo(userInfo),
              connect: function() {
                console.debug(`Now subscribed to ${channels.WAGERS} channel.`); // eslint-disable-line

                return resolve();
              }
            });
          });
        })
        .then(function() { // Get here now information
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

    function onWagersReceived(wagers) { // eslint-disable-line
      console.debug(`Wagers received...`, wagers); // eslint-disable-line
    }

    function onTrackResultsRecieved(trackResults) { // eslint-disable-line
      console.debug(`Track results received...`, trackResults); // eslint-disable-line
    }

    function onPresenceEventReceived(ev) { // eslint-disable-line
      if (!ev.state) {
        return;
      }

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
    }

    function onPresenceJoin(ev) {
      console.debug('Presence join event received...', ev); // eslint-disable-line
    }

    function onPresenceLeave(ev) {
      console.debug('Presence leave event received...', ev); // eslint-disable-line
    }

    function onPresenceStateChange(ev) {
      console.debug('Presence state change event received...', ev); // eslint-disable-line
    }

    function mapToUserInfo(user) { // eslint-disable-line
      let data;

      if (!user) {
        return user;
      }

      data = {
        email: user.email,
        firstName: user.firstName || user.givenName,
        lastName: user.lastName || user.surname
      };

      data.fullName = user.fullName || `${data.firstName} ${data.lastName}`;

      return data;
    }
  }
})();

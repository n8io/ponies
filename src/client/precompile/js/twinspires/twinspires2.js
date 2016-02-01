(function() {
  const WAGERS_CHANNEL = 'v2-wagers';
  const n8 = {
    user: getUserInfo()
  };

  init();

  function init() {
    if (window.n8) { // eslint-disable-line
      console.warn('Pownies script already loaded. I ain\'t gonna do shit.'); // eslint-disable-line

      return;
    }

    window.n8 = true; // eslint-disable-line

    clearConsole()
      .then(function() {
        return injectElements();
      })
      .then(function() {
        return initializeControlData();
      })
      .then(function() {
        return initializePoolTypes();
      })
      .then(function() {
        return initalizeTracks();
      })
      .then(function() {
        console.log(`Finished init.`, n8); // eslint-disable-line
      })
      ;

    // initializePubNub();
    // initializePoolTypes();
    // initalizeTracks();
    // refreshControlData();
    // bindLeave();

    // setTimeout(toggleSync, 4000);
  }

  function clearConsole() {
    return new Promise(function(resolve) {
      console.clear();

      return resolve();
    });
  }

  function injectElements() {
    const scripts = [
      '//cdn.pubnub.com/pubnub-3.7.18.min.js',
      '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js',
      '//cdnjs.cloudflare.com/ajax/libs/async/1.5.2/async.min.js',
      '//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.min.js'
    ];

    return Promise
      .all(getScriptLoadPromises(scripts)) // Load scripts
      .then(function() { // Load moment timezone
        const momentWithTZ = '//cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.0/moment-timezone-with-data-2010-2020.min.js';

        return Promise.all(getScriptLoadPromises(momentWithTZ));
      })
      .then(function() { // Do everything else
        injectCss();
        injectSyncToggle();

        return injectIFrame();
      })
      ;

    function injectCss() {
      const css = `
        <style id='css-sync'>
          .noshow {display:none;height:0;width:0;}
          #syncButton {position: absolute;bottom: 22px;right: 25px;z-index: 99999;height: 33px;width: 105px;border-radius:3px;border:1px solid transparent;}
          #syncButton div {height:14px;width:14px;border-radius:14px;background-color:#bbb;margin-right:10px;float:right;}
          #syncButton div.on {background-color:#4BBA4B;}
        </style>
      `;

      $('body').append(css); // eslint-disable-line
    }

    function injectSyncToggle() {
      const button = $('<button id="syncButton" disabled><span>Sync: --</span><div class=""></div></button>'); // eslint-disable-line

      button.on('click', function() {
        // toggleSync();
      });

      $('body').prepend(button); // eslint-disable-line
    }

    function injectIFrame() {
      const ifm = document.createElement(`iframe`); // eslint-disable-line

      console.debug(`Injecting iframe for wager creds...`); // eslint-disable-line

      ifm.id = `iWager`;
      ifm.src = `/php/rtb/?print=true&cb=${(new Date()).getTime()}`;
      ifm.className = `noshow`;
      document.body.appendChild(ifm); // eslint-disable-line

      return new Promise(function(resolve) {
        setTimeout(function() { // eslint-disable-line
          n8.wagerCreds = $('#iWager')[0].contentWindow.Cdi.AppConfig.WS; // eslint-disable-line

          console.debug(`... iframe creds found.`); // eslint-disable-line

          return resolve();
        }, 1000);
      });
    }

    function getScriptLoadPromises(scripts) {
      scripts = typeof scripts === 'string' ? [scripts] : scripts; // eslint-disable-line

      return scripts.map(function(src) {
        return new Promise(function(resolve, reject) {
          const s = document.createElement('script'); // eslint-disable-line

          document.getElementsByTagName('head')[0].appendChild(s); // eslint-disable-line

          s.onload = function() {
            return resolve();
          };
          s.onerror = function() {
            return reject();
          };
          s.src = src;
        });
      });
    }
  }

  function initializeControlData() {
    const uc = Cdi.AppConfig.WS; // eslint-disable-line
    const wc = n8.wagerCreds;

    n8.wagerCreds.wagersUrl = '/php/fw/php_BRIS_BatchAPI/2.3/Rtb/GetData?' // eslint-disable-line
        + '&username=' + wc.USERNAME
        + '&password=' + wc.PASSWORD
        + '&ip=' + wc.CDI_CLIENT_IP
        + '&affid=' + wc.CDI_SAID
        + '&affiliateId=' + wc.CDI_SAID
        + '&account=' + n8.user.accountNum
        + '&authKey=' + n8.user.authKey
        + '&output=json'
        + '&limit=200'
        ;

    n8.wagerCreds.poolTypesUrl = '/php/fw/php_BRIS_BatchAPI/2.3/Tote/PoolTypes?' // eslint-disable-line
      + '&username=' + wc.USERNAME
      + '&password=' + wc.PASSWORD
      + '&ip=' + wc.CDI_CLIENT_IP
      + '&affid=' + wc.CDI_SAID
      + '&affiliateId=' + wc.CDI_SAID
      + '&output=json'
      ;

    n8.wagerCreds.trackListUrl = '/php/fw/php_BRIS_BatchAPI/2.3/Cdi/TrackList?multisource=1&vidType=FLV' // eslint-disable-line
      + '&username=' + uc.USERNAME
      + '&password=' + uc.PASSWORD
      + '&ip=' + uc.CDI_CLIENT_IP
      + '&affid=' + uc.CDI_SAID
      + '&output=json'
      ;

    return n8;
  }

  function initializePoolTypes() {
    return new Promise(function(resolve) {
      console.debug('Fetching pool types...'); // eslint-disable-line

      $.getJSON(n8.wagerCreds.poolTypesUrl, function(data) {
        console.debug('... pool types received.'); // eslint-disable-line

        return resolve(data.PoolTypes);
      });
    });
  }

  function initalizeTracks() {
    return new Promise(function(resolve) {
      console.debug(`Fetching track list...`); // eslint-disable-line

      $.getJSON(n8.wagerCreds.trackListUrl, function(data) {
        console.debug(`... track list received.`); // eslint-disable-line

        n8.tracks = data.Tracks;

        return resolve();
      });
    });
  }

  function getUserInfo() {
    const obj = JSON.parse(sessionStorage.getItem('GlobalData')); // eslint-disable-line

    if (obj) {
      const key = Object.keys(obj)[0];
      const user = obj[key];

      return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
    }

    return {};
  }

  // function bindLeave() {
  //   $(window).bind('unload',function() {
  //     window.n8.isSyncing = false;

  //     window.PubNub.state({
  //       channel: WAGER_SYNC_CHANNEL,
  //       state: getUserState(),
  //       callback: function() {},
  //       error: function() {}
  //     });
  //   });
  // }

  // function initializePubNub() {
  //   return
  //     new Promise(function(resolve, reject) {
  //       console.debug(`Initing PubNub...`); // eslint-disable-line

  //       return PUBNUB.init({
  //         publish_key: '{{pubsub_publish_key}}',
  //         subscribe_key: '{{pubsub_subscribe_key}}',
  //         ssl: true
  //       });
  //     })
  //     .then(function(pubNubInstance) {
  //       n8.PubNub = pubNubInstance;

  //       return new Promise(function(resolve) {
  //         n8.PubNub.subscribe({
  //           channel: WAGERS_CHANNEL,
  //           subscribe_key: '{{pubsub_subscribe_key}}',
  //           message: function() {},
  //           state: getUserState(),
  //           connect: function() {
  //             console.debug(`Successfully subscribed to ${WAGERS_CHANNEL} channel.`);

  //             return resolve();
  //           }
  //         })
  //       });
  //     })
  //     ;

  //   setTimeout(function() {
  //     console.debug('Initing PubNub....');

  //     window.PubNub = PUBNUB.init({
  //       publish_key: 'pub-c-c51fe29c-192d-449c-a61b-1715f42ced37',
  //       subscribe_key: 'sub-c-2f1cbf66-be98-11e5-a9b2-02ee2ddab7fe',
  //       ssl: true
  //     });
  //   }, 1000);

  //   setTimeout(function() {
  //     window.PubNub.subscribe({
  //       channel: WAGER_SYNC_CHANNEL,
  //       'subscribe_key': '{{pubsub_subscribe_key}}',
  //       message: function() {},
  //       state: getUserState()
  //     });

  //     console.debug('Now subscribed to ' + WAGER_SYNC_CHANNEL + ' channel.');
  //   }, 1500);
  // }

  // function getUserState() {
  //   return {
  //     email: window.n8.user.email,
  //     firstName: window.n8.user.firstName,
  //     lastName: window.n8.user.lastName,
  //     isSyncing: window.n8.isSyncing
  //   };
  // }

  // function refreshRaceResults() {
  //   const callbackFns = [];
  //   let tracks = _.map(window.n8.wagers || [], function(w) {
  //     return window.n8.tracks.find(function(t) { return t.EventCode === w.eventCode; }).BrisCode;
  //   });

  //   tracks = _.uniq(tracks);

  //   if (!tracks.length) {
  //     return;
  //   }

  //   console.debug('Refreshing race results...', tracks);
  //   window.n8.mtps = getTrackMtps();

  //   tracks.forEach(function(tr) {
  //     const track = window.n8.tracks.find(function(t) { return t.BrisCode === tr; });
  //     callbackFns.push(function(cb) {
  //       getRaceResults(track, cb);
  //     });
  //   });

  //   async.parallel(callbackFns, onComplete);

  //   function onComplete(err, results) {
  //     console.debug('... race results received.', results);

  //     if (err) {
  //       return;
  //     }

  //     pushRaceResults(results);
  //   }
  // }

  // function getTrackMtps() {
  //   const $tracks = $('body').find('.clsTrackButton');
  //   const tracks = [];

  //   $tracks.each(function(index, t) {
  //     var $t = $(t);
  //     var track = {};

  //     track.name = $t.attr('title');
  //     track.BrisCode = $t.attr('id').split('_')[1];
  //     track.type = $t.attr('id').split('_')[2];

  //     if($t.find('[id^="finish_"]:visible').length) {
  //       track.currentRace = {
  //         id: 99,
  //         mtp: 99
  //       }
  //     }
  //     else {
  //       track.currentRace = {
  //         id: parseInt($t.find('.clsRaceNum').text(), 0),
  //         mtp: convertToMtp($t.find('.clsRaceMtp').text())
  //       };
  //     }

  //     track.currentRace.level = convertMtpToLevel(track.currentRace.mtp);

  //     tracks.push(track);
  //   });

  //   window.tracks = tracks;

  //   return tracks;

  //   function convertToMtp(text) {
  //     text = text || '';

  //     switch (text.toLowerCase()) {
  //       case '99':
  //         // Not started, races are not running
  //         return 99;
  //       case 'off':
  //         // Race is currently being ran
  //         return -1;
  //       default:
  //         return parseInt(text, 0);
  //     }
  //   }

  //   function convertMtpToLevel(mtp) {
  //     switch (mtp) {
  //       case 99:
  //         return 'NOT_RUNNING';
  //       case -1:
  //         return 'RUNNING';
  //       default:
  //         if (mtp === 0) {
  //           return 'NOW';
  //         }
  //         else if (mtp >= 1 && mtp <= 2) {
  //           return 'VERY_SOON';
  //         }
  //         else if (mtp > 2 && mtp <= 5) {
  //           return 'SOON';
  //         }
  //         else if (mtp > 5 && mtp <= 7) {
  //           return 'KINDA_SOON';
  //         }
  //         else if (mtp >= 8) {
  //           return 'NOT_SOON'
  //         }
  //     }
  //   }
  // }

  // function readCookie(name) {

  //   return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];
  // }

  // function updateSyncButton(isSyncing) {
  //   const $btn = $('body').find('#syncButton');
  //   const $span = $btn.find('span');
  //   const $indicator = $btn.find('div');

  //   $btn.removeAttr('disabled');

  //   if (isSyncing) {
  //     $span.text('Sync: ON')
  //     $indicator.addClass('on');
  //     console.debug('Started syncing wagers...');
  //   }
  //   else {
  //     $span.text('Sync: OFF');
  //     $indicator.removeClass('on');
  //     console.debug('Stopped syncing wagers.');
  //   }
  // }

  // function toggleSync() {
  //   const isSyncing = window.n8.isSyncing = !window.n8.isSyncing;

  //   updateSyncButton(isSyncing);

  //   if (!isSyncing) {
  //     clearInterval(window.__wagerInterval);
  //     clearInterval(window.__allWagersInterval);
  //     clearInterval(window.__resultsInterval);
  //     clearTimeout(window.__nowAllWagers);
  //     clearTimeout(window.__nowRefreshRaceResults);

  //     PubNub.state({
  //       channel: WAGER_SYNC_CHANNEL,
  //       state: getUserState(),
  //       callback: function() {
  //         console.debug('Stopped syncing.')
  //       },
  //       error: function() {}
  //     });

  //     window.n8.hasSyncedBefore = false;

  //     return;
  //   }

  //   PubNub.state({
  //     channel: WAGER_SYNC_CHANNEL,
  //     state: getUserState(),
  //     callback: function() {
  //       console.debug('Started syncing.')
  //     },
  //     error: function() {}
  //   });

  //   const threeSeconds = 1000 * 3;
  //   const fiveSeconds = 1000 * 5;
  //   const thirtySeconds = 1000 * 30;
  //   const twoMinutes = 1000 * 60 * 2;

  //   window.__wagerInterval = setInterval(diffWagers, threeSeconds);
  //   window.__allWagersInterval = setInterval(allWagers, twoMinutes);
  //   window.__resultsInterval = setInterval(refreshRaceResults, thirtySeconds);

  //   // Fire near now the first go round
  //   window.__nowAllWagers = setTimeout(allWagers, threeSeconds);
  //   window.__nowRefreshRaceResults = setTimeout(refreshRaceResults, fiveSeconds);

  //   function diffWagers() {
  //     const cb = '&cb=' + (new Date()).getTime();

  //     $.getJSON(window.n8.wagerCreds.wagersUrl + cb, function(data) {
  //       onWagersReturned(data);
  //     });
  //   }

  //   function allWagers() {
  //     const cb = '&cb=' + (new Date()).getTime();

  //     $.getJSON(window.n8.wagerCreds.wagersUrl + cb, function(data) {
  //       onWagersReturned(data, true);
  //     });
  //   }

  //   function onWagersReturned(data, forceSendAll) {
  //     let wagers = data.Wagers;

  //     if (window.n8.hasSyncedBefore && !forceSendAll) {
  //       wagers = _.differenceWith(data.Wagers, window.n8.wagers, _.isEqual);
  //     }

  //     pushWagers(wagers, window.n8.hasSyncedBefore);

  //     window.n8.wagers = data.Wagers;
  //     window.n8.hasSyncedBefore = true;
  //   }
  // }

  // function pushRaceResults(results) {
  //   const RESULTS_BULK_CHANNEL = 'results-all';
  //   const tracks = [];

  //   (results || []).forEach(function(result) {
  //     const track = {
  //       BrisCode: result.track.BrisCode,
  //       mtp: result.track.mtp,
  //       races: []
  //     };

  //     (result.races || []).forEach(function(race) {
  //       track.races.push({
  //         race: race.id,
  //         win: race.wps[0],
  //         place: race.wps[1],
  //         show: race.wps[2],
  //         exotics: race.exotics
  //       });
  //     });

  //     tracks.push(track);
  //   });

  //   if (tracks.length) {
  //     tracks.forEach(function(t) {
  //       console.debug('Pushing race results...', t);
  //       window.PubNub.publish({
  //         channel: RESULTS_BULK_CHANNEL,
  //         message: t
  //       });
  //     });

  //     window.n8.results = tracks;
  //   }
  // }

  // function pushWagers(wagers, isDiff) {
  //   if (!wagers || !wagers.length) {
  //     return;
  //   }

  //   const slimWagers = convertWagersToSlimObjects(wagers);

  //   if (!!isDiff) {
  //     console.debug('Pushing wagers diff...', slimWagers);
  //     window.PubNub.publish({
  //       channel: WAGER_ALL_CHANNEL,
  //       message: slimWagers
  //     });
  //   }
  //   else {
  //     console.debug('Pushing wagers bulk...', slimWagers);
  //     window.PubNub.publish({
  //       channel: WAGER_ALL_CHANNEL,
  //       message: slimWagers
  //     });
  //   }
  // }

  // function convertWagersToSlimObjects(wagers) {
  //   if (!wagers || !window.n8.poolTypes || !window.n8.poolTypes.length) {
  //     return [];
  //   }

  //   return wagers.map(function(w) {
  //     const offsetTime = 1000 * 10; // Their server times are a few seconds slow
  //     const newWager = {};

  //     newWager.timestamp = moment.tz(w.placedDate, 'America/Los_Angeles').toDate().getTime() - offsetTime; // Wager dates are local to America/Los_Angeles
  //     newWager.id = w.serialNumber;
  //     newWager.user = _.pick(window.n8.user, ['email', 'firstName', 'lastName', 'accountNum']);
  //     newWager.betAmount = parseFloat(w.totalCost, 10);
  //     newWager.payoutAmount = parseFloat(w.payoutAmount, 10);
  //     newWager.type = window.n8.poolTypes.find(function(pt) { return pt.Code === w.poolType; });
  //     newWager.selections = w.runnersList;
  //     newWager.race = {id: w.race};
  //     newWager.track = window.n8.tracks.find(function(t) { return t.EventCode === w.eventCode; });
  //     newWager.eventCode = newWager.track.EventCode;
  //     newWager.status = w.status;
  //     newWager.refundAmount = w.refundAmount;

  //     return newWager;
  //   });

  //   // baseAmount: 1
  //   // conditionalWager: "false"
  //   // conditions: "none"
  //   // eventCode: "DUN"
  //   // eventDate: "2016-01-21"
  //   // failedReason: ""
  //   // frozenWager: "false"
  //   // futureWager: "false"
  //   // leaderBoardWager: "false"
  //   // payoutAmount: 0
  //   // placedDate: "2016-01-21 06:57:13"
  //   // poolType: "WN"
  //   // race: 1
  //   // refundAmount: 0
  //   // runnersList: "6"
  //   // serialNumber: "ecf9d-f06bb"
  //   // status: "PAID"
  //   // totalCost: 1
  // }

  // function getRaceResults(track, callback) {
  //   callback = typeof callback === 'function' ? callback : function() {};

  //   const lookups = {
  //     'thoroughbred': 1,
  //     'harness': 2
  //   };

  //   const url = '/secure-bin/results_tracks.cgi?track=' + track.BrisCode + '&race=all&type=' + lookups[track.TrackType.toLowerCase()];

  //   console.debug('Fetching race results...', url);

  //   $.get(url, function onSuccess(html) {
  //     const data = parseResultsToJson(html) || {};

  //     data.track = {
  //       BrisCode: track.BrisCode
  //     };

  //     const foundMtp = window.n8.mtps.find(function(mtp) {
  //       return mtp.BrisCode.toLowerCase() === data.track.BrisCode.toLowerCase();
  //     });

  //     if (foundMtp) {
  //       data.track.mtp = foundMtp.currentRace;
  //     }

  //     return callback(null, data);
  //   });
  // }

  // function parseResultsToJson(html) {
  //   if ($('.data_hl').length) {
  //     return null; // No results data
  //   }

  //   const data = {races: []};
  //   const $wpsTbls = $(html).find('.toteboard:even');
  //   const $exTbls = $(html).find('.toteboard:odd');

  //   $(html).find('th[colspan="4"] a,script').remove();

  //   const raceIds = [];
  //   const regex = /Race (\d+)/ig;

  //   $(html).find('th[colspan="4"]').each(function(index, th) {
  //     const matches = $(th).text().match(regex);
  //     raceIds.push(parseInt(matches[0].replace('Race ', ''), 0));
  //   });

  //   $wpsTbls.each(function(i, tbl) {
  //     const $tbl = $(tbl);
  //     const $xbl = $($exTbls[i]);
  //     const race = {
  //       id: raceIds[i],
  //       wps: [],
  //       exotics: []
  //     };

  //     const $rows = $tbl.find('tr:gt(1)');

  //     if ($rows.length === 0) {
  //       return null; // No results data
  //     }

  //     $rows.each(function(j, row) {
  //       const $row = $(row);
  //       const payout = {
  //         place: j + 1
  //       };

  //       const winAmountDisplay = $row.find('td:eq(1)').text().replace(/^[\.]$/ig, '');
  //       const placeAmountDisplay = $row.find('td:eq(2)').text().replace(/^[\.]$/ig, '');
  //       const showAmountDisplay = $row.find('td:eq(3)').text().replace(/^[\.]$/ig, '');

  //       payout.horse = $row.find('td:eq(0)').text();
  //       payout.winAmount = parseFloat(winAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;
  //       payout.placeAmount = parseFloat(placeAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;
  //       payout.showAmount = parseFloat(showAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;

  //       race.wps.push(payout);
  //     });

  //     const $xRows = $xbl.find('tr:gt(1)');

  //     $xRows.each(function(k, row) {
  //       const $row = $(row);

  //       const payout = {};

  //       const wagerType = $row.find('td:eq(0)').text().trim();
  //       const winAmountDisplay = $row.find('td:eq(2)').text().trim();

  //       payout.type = wagerType.replace(/[\$0-9\. ]/ig, '');
  //       payout.denomination = parseFloat(wagerType.replace(/[^0-9\.]/ig, ''), 0) || 0;
  //       payout.winCombo = $row.find('td:eq(1)').text().split('/');
  //       payout.winAmount = parseFloat(winAmountDisplay.replace(/[^0-9\.]/ig, ''), 0) || 0;

  //       race.exotics.push(payout);
  //     });

  //     data.races.push(race);
  //   });

  //   return data;
  // }
})();

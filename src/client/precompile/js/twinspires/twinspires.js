(function() {
  'use strict';

  init();

  const doc = document; // eslint-disable-line
  const win = window; // eslint-disable-line
  let n8 = win.n8; // eslint-disable-line

  function init() {
    if (n8) {
      console.warn('Pownies script already loaded. I ain\'t gonna do shit.'); // eslint-disable-line

      return;
    }

    n8 = {
      isSyncing: false,
      hasSyncedBefore: false
    };

    clearConsole();
    injectElements();
    initializePubNub();
    initializePoolTypes();
    initalizeTracks();
    refreshControlData();

    setTimeout(toggleSync, 3000); // eslint-disable-line
  }

  function clearConsole() {
    try {
      console.clear(); // eslint-disable-line
    }
    finally { // eslint-disable-line
    }
  }

  function injectElements() {
    injectIFrame();
    injectScripts();
    injectCss();
    injectSyncToggle();

    function injectScripts() {
      const scripts = [
        '//cdn.pubnub.com/pubnub-3.7.18.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/async/1.5.2/async.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.min.js'
      ];

      scripts.forEach(function(src) {
        const s = doc.createElement('script');

        s.src = src;
        $('head').append(s); // eslint-disable-line
      });

      setTimeout(function() { // eslint-disable-line
        const s = doc.createElement('script');

        s.src = '//cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.0/moment-timezone-with-data-2010-2020.min.js';
        $('head').append(s); // eslint-disable-line
      }, 350);
    }

    function injectCss() {
      const css = $( // eslint-disable-line
      `
        <style id='css-sync'>
          .noshow {display:none;height:0;width:0;}
          #syncButton {position: absolute;bottom: 22px;right: 25px;z-index: 99999;height: 33px;width: 105px;border-radius:3px;border:1px solid transparent;}
          #syncButton div {height:14px;width:14px;border-radius:14px;background-color:#bbb;margin-right:10px;float:right;}
          #syncButton div.on {background-color:#4BBA4B;}
        </style>
      `
      );

      $('body').append(css); // eslint-disable-line
    }

    function injectIFrame() {
      const ifm = doc.createElement('iframe');

      ifm.id = 'iWager';
      ifm.src = '/php/rtb/?print=true';
      ifm.className = 'noshow';
      doc.body.appendChild(ifm);

      setTimeout(function() { // eslint-disable-line
        win.__wagerCreds = $('#iWager')[0].contentwin.Cdi.AppConfig.WS; // eslint-disable-line
      }, 1000);
    }

    function injectSyncToggle() {
      const button = $('<button id="syncButton" disabled><span>Sync: --</span><div class=""></div></button>'); // eslint-disable-line

      button.on('click', function() {
        toggleSync();
      });

      $('body').prepend(button); // eslint-disable-line
    }
  }

  function initializePubNub() {
    setTimeout(function() { // eslint-disable-line
      console.debug('Initing PubNub....'); // eslint-disable-line

      win.PubNub = PUBNUB.init({ // eslint-disable-line
        'publish_key': 'pub-c-c51fe29c-192d-449c-a61b-1715f42ced37',
        'subscribe_key': 'sub-c-2f1cbf66-be98-11e5-a9b2-02ee2ddab7fe',
        ssl: true,
        uuid: decodeURIComponent(readCookie('emailid'))
      });
    }, 1000);
  }

  function initializePoolTypes() {
    if (n8.poolTypes) {
      return;
    }

    if (!n8.wagerCreds || !n8.wagerCreds.poolTypesUrl) {
      setTimeout(initializePoolTypes, 100); // eslint-disable-line

      return;
    }

    console.debug('Fetching pool types...'); // eslint-disable-line

    $.getJSON(n8.wagerCreds.poolTypesUrl, onSuccess); // eslint-disable-line

    function onSuccess(data) {
      console.debug('... pool types received.'); // eslint-disable-line
      n8.poolTypes = data.PoolTypes;
    }
  }

  function initalizeTracks(force) {
    if (n8.tracks && !force) {
      return;
    }

    if (!n8.wagerCreds || !n8.wagerCreds.trackListUrl) {
      setTimeout(initalizeTracks, 100); // eslint-disable-line

      return;
    }

    console.debug('Fetching track list...'); // eslint-disable-line

    $.getJSON(n8.wagerCreds.trackListUrl, onSuccess); // eslint-disable-line

    function onSuccess(data) {
      console.debug('... track list received.'); // eslint-disable-line
      n8.tracks = data.Tracks;
    }
  }

  function refreshRaceResults() {
    const callbackFns = [];
    let tracks = _.map(n8.wagers || [], function(w) { // eslint-disable-line
      return n8.tracks.find(function(t) { return t.EventCode === w.eventCode; }).BrisCode; // eslint-disable-line
    });

    tracks = _.uniq(tracks); // eslint-disable-line

    if (!tracks.length) {
      return;
    }

    console.debug('Refreshing race results...', tracks); // eslint-disable-line
    tracks.forEach(function(tr) {
      callbackFns.push(function(cb) {
        getRaceResults(tr, cb);
      });
    });

    async.parallel(callbackFns, onComplete); // eslint-disable-line

    function onComplete(err, results) {
      console.debug('... race results received.', results); // eslint-disable-line

      if (err) {
        return;
      }

      pushRaceResults(results);
    }
  }

  function refreshControlData() {
    const fiveSeconds = 1000 * 5;

    refresh(); // on start, fire immediately

    setInterval(refresh, fiveSeconds); // eslint-disable-line

    function refresh() {
      // console.debug('Refreshing control data...');
      n8.user = getUserInfo();

      if (win.__wagerCreds) {
        const wc = win.__wagerCreds;
        const uc = Cdi.AppConfig.WS; // eslint-disable-line

        n8.wagerCreds = wc;

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
      }
    }
  }

  function getUserInfo() {
    const obj = JSON.parse(sessionStorage.getItem('GlobalData')); // eslint-disable-line
    const key = Object.keys(obj)[0];

    return obj[key];
  }

  function readCookie(name) {
    return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(doc.cookie)) && name[1]; // eslint-disable-line
  }

  function updateSyncButton(isSyncing) {
    const $btn = $('body').find('#syncButton'); // eslint-disable-line
    const $span = $btn.find('span');
    const $indicator = $btn.find('div');

    $btn.removeAttr('disabled');

    if (isSyncing) {
      $span.text('Sync: ON');
      $indicator.addClass('on');

      console.debug('Started syncing wagers...'); // eslint-disable-line
    }
    else {
      $span.text('Sync: OFF');
      $indicator.removeClass('on');

      console.debug('Stopped syncing wagers.'); // eslint-disable-line
    }
  }

  function toggleSync() {
    const isSyncing = n8.isSyncing = !n8.isSyncing;

    updateSyncButton(isSyncing);

    if (!isSyncing) {
      clearInterval(win.__wagerInterval);
      clearInterval(win.__allWagersInterval);
      clearInterval(win.__resultsInterval);
      clearTimeout(win.__nowAllWagers);
      clearTimeout(win.__nowRefreshRaceResults);

      n8.hasSyncedBefore = false;

      return;
    }

    const threeSeconds = 1000 * 3;
    const fiveSeconds = 1000 * 5;
    const thirtySeconds = 1000 * 30;
    const twoMinutes = 1000 * 60 * 2;

    win.__wagerInterval = setInterval(diffWagers, threeSeconds); // eslint-disable-line
    win.__allWagersInterval = setInterval(allWagers, twoMinutes); // eslint-disable-line
    win.__resultsInterval = setInterval(refreshRaceResults, thirtySeconds); // eslint-disable-line

    // Fire near now the first go round
    win.__nowAllWagers = setTimeout(allWagers, threeSeconds); // eslint-disable-line
    win.__nowRefreshRaceResults = setTimeout(refreshRaceResults, fiveSeconds); // eslint-disable-line

    function diffWagers() {
      $.getJSON(n8.wagerCreds.wagersUrl, function(data) { // eslint-disable-line
        onWagersReturned(data);
      });
    }

    function allWagers() {
      $.getJSON(n8.wagerCreds.wagersUrl, function(data) { // eslint-disable-line
        onWagersReturned(data, true);
      });
    }

    function onWagersReturned(data, forceSendAll) {
      let wagers = data.Wagers;

      if (n8.hasSyncedBefore && !forceSendAll) {
        wagers = _.differenceWith(data.Wagers, n8.wagers, _.isEqual); // eslint-disable-line
      }

      pushWagers(wagers, n8.hasSyncedBefore);

      n8.wagers = data.Wagers;
      n8.hasSyncedBefore = true;
    }
  }

  function pushRaceResults(results) {
    const RESULTS_BULK_CHANNEL = 'results-all';
    const tracks = [];

    (results || []).forEach(function(result) {
      const track = {
        BrisCode: result.track.BrisCode,
        races: []
      };

      (result.races || []).forEach(function(race) {
        track.races.push({
          race: race.id,
          win: race.wps[0],
          place: race.wps[1],
          show: race.wps[2],
          exotics: race.exotics
        });
      });

      tracks.push(track);
    });

    if (tracks.length) {
      tracks.forEach(function(t) {
        console.debug('Pushing race results...', t); // eslint-disable-line

        win.PubNub.publish({
          channel: RESULTS_BULK_CHANNEL,
          message: t
        });
      });

      n8.results = tracks;
    }
  }

  function pushWagers(wagers, isDiff) {
    const WAGER_ALL_CHANNEL = 'wagers-all';

    if (!wagers || !wagers.length) {
      return;
    }

    const slimWagers = convertWagersToSlimObjects(wagers);

    if (isDiff) {
      console.debug('Pushing wagers diff...', slimWagers); // eslint-disable-line

      win.PubNub.publish({
        channel: WAGER_ALL_CHANNEL,
        message: slimWagers
      });
    }
    else {
      console.debug('Pushing wagers bulk...', slimWagers); // eslint-disable-line

      win.PubNub.publish({
        channel: WAGER_ALL_CHANNEL,
        message: slimWagers
      });
    }
  }

  function convertWagersToSlimObjects(wagers) {
    if (!wagers || !n8.poolTypes || !n8.poolTypes.length) {
      return [];
    }

    return wagers.map(function(w) {
      const newWager = {};

      // Wager dates are local to America/Los_Angeles
      newWager.timestamp = moment.tz(w.placedDate, 'America/Los_Angeles').toDate().getTime();  // eslint-disable-line
      newWager.id = w.serialNumber;
      newWager.user = _.pick(n8.user, ['email', 'firstName', 'lastName']); // eslint-disable-line
      newWager.betAmount = parseFloat(w.totalCost, 10);
      newWager.payoutAmount = parseFloat(w.payoutAmount, 10);
      newWager.type = n8.poolTypes.find(function(pt) {
        return pt.Code === w.poolType;
      });
      newWager.selections = w.runnersList;
      newWager.race = {id: w.race};
      newWager.track = n8.tracks.find(function(t) {
        return t.EventCode === w.eventCode;
      });
      newWager.eventCode = newWager.track.EventCode;

      return newWager;
    });

    // baseAmount: 1
    // conditionalWager: "false"
    // conditions: "none"
    // eventCode: "DUN"
    // eventDate: "2016-01-21"
    // failedReason: ""
    // frozenWager: "false"
    // futureWager: "false"
    // leaderBoardWager: "false"
    // payoutAmount: 0
    // placedDate: "2016-01-21 06:57:13"
    // poolType: "WN"
    // race: 1
    // refundAmount: 0
    // runnersList: "6"
    // serialNumber: "ecf9d-f06bb"
    // status: "PAID"
    // totalCost: 1
  }

  function getRaceResults(track, callback) {
    callback = typeof callback === 'function' ? callback : function() {}; // eslint-disable-line

    const url = '/secure-bin/results_tracks.cgi?track=' + track + '&race=all&type=1&type=1'; // eslint-disable-line

    console.debug('Fetching race results...', url); // eslint-disable-line

    $.get(url, function onSuccess(html) { // eslint-disable-line
      const data = parseResultsToJson(html) || {};

      data.track = {
        BrisCode: track
      };

      return callback(null, data);
    });
  }

  function parseResultsToJson(html) {
    if ($('.data_hl').length) { // eslint-disable-line
      return null; // No results data
    }

    const data = {races: []};
    const $wpsTbls = $(html).find('.toteboard:even'); // eslint-disable-line
    const $exTbls = $(html).find('.toteboard:odd'); // eslint-disable-line

    $wpsTbls.each(function(i, tbl) {
      const $tbl = $(tbl); // eslint-disable-line
      const $xbl = $($exTbls[i]); // eslint-disable-line
      const race = {
        id: i + 1,
        wps: [],
        exotics: []
      };

      const $rows = $tbl.find('tr:gt(1)');

      $rows.each(function(j, row) {
        const $row = $(row); // eslint-disable-line
        const payout = {
          place: j + 1
        };

        const winAmountDisplay = $row.find('td:eq(1)').text().replace(/^[\.]$/ig, '');
        const placeAmountDisplay = $row.find('td:eq(2)').text().replace(/^[\.]$/ig, '');
        const showAmountDisplay = $row.find('td:eq(3)').text().replace(/^[\.]$/ig, '');

        payout.horse = $row.find('td:eq(0)').text();
        payout.winAmount = parseFloat(winAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;
        payout.placeAmount = parseFloat(placeAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;
        payout.showAmount = parseFloat(showAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;

        race.wps.push(payout);
      });

      const $xRows = $xbl.find('tr:gt(1)');

      $xRows.each(function(k, row) {
        const $row = $(row); // eslint-disable-line

        const payout = {};

        const wagerType = $row.find('td:eq(0)').text().trim();
        const winAmountDisplay = $row.find('td:eq(2)').text().trim();

        payout.type = wagerType.replace(/[\$0-9\. ]/ig, '');
        payout.denomination = parseFloat(wagerType.replace(/[^0-9\.]/ig, ''), 0) || 0;
        payout.winCombo = $row.find('td:eq(1)').text().split('/');
        payout.winAmount = parseFloat(winAmountDisplay.replace(/[^0-9\.]/ig, ''), 0) || 0;

        race.exotics.push(payout);
      });

      data.races.push(race);
    });

    return data;
  }
})();

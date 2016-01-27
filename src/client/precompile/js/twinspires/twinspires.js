/* eslint-disable */
(function() {
  var WAGER_SYNC_CHANNEL = 'sync';
  var WAGER_DIFF_CHANNEL = 'wager';
  var WAGER_ALL_CHANNEL = 'wagers-all';

  init();

  function init() {
    if (window.n8) {
      console.warn('Pownies script already loaded. I ain\'t gonna do shit.'); // eslint-disable-line

      return;
    }

    window.n8 = {
      isSyncing: false,
      hasSyncedBefore: false
    };

    clearConsole();
    injectElements();
    initializePubNub();
    initializePoolTypes();
    initalizeTracks();
    refreshControlData();

    setTimeout(toggleSync, 3000);
  }

  function clearConsole() {
    try {
      console.clear();
    }
    finally {}
  }

  function injectElements() {
    injectIFrame();
    injectScripts();
    injectCss();
    injectSyncToggle();

    function injectScripts() {
      var scripts = [
        '//cdn.pubnub.com/pubnub-3.7.18.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/async/1.5.2/async.min.js',
        '//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.min.js'
      ];

      scripts.forEach(function(src) {
        var s = document.createElement('script');
        s.src = src;
        $('head').append(s);
      });

      setTimeout(function() {
        var s = document.createElement('script');
        s.src = '//cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.0/moment-timezone-with-data-2010-2020.min.js';
        $('head').append(s);
      }, 350);
    }

    function injectCss() {
      var css = $(`
        <style id='css-sync'>
          .noshow {display:none;height:0;width:0;}
          #syncButton {position: absolute;bottom: 22px;right: 25px;z-index: 99999;height: 33px;width: 105px;border-radius:3px;border:1px solid transparent;}
          #syncButton div {height:14px;width:14px;border-radius:14px;background-color:#bbb;margin-right:10px;float:right;}
          #syncButton div.on {background-color:#4BBA4B;}
        </style>
      `);
      $('body').append(css);
    }

    function injectIFrame() {
      var ifm = document.createElement('iframe');
      ifm.id = 'iWager';
      ifm.src = '/php/rtb/?print=true';
      ifm.className = 'noshow';
      document.body.appendChild(ifm);

      setTimeout(function() {
        window.__wagerCreds = $('#iWager')[0].contentWindow.Cdi.AppConfig.WS;
      }, 1000);
    }

    function injectSyncToggle() {
      var button = $('<button id="syncButton" disabled><span>Sync: --</span><div class=""></div></button>');

      button.on('click', function() {
        toggleSync();
      });

      $('body').prepend(button);
    }
  }

  function initializePubNub() {
    setTimeout(function() {
      console.debug('Initing PubNub....');

      window.PubNub = PUBNUB.init({
        publish_key: 'pub-c-c51fe29c-192d-449c-a61b-1715f42ced37',
        subscribe_key: 'sub-c-2f1cbf66-be98-11e5-a9b2-02ee2ddab7fe',
        ssl: true
      });
    }, 1000);
  }

  function initializePoolTypes() {
    if (window.n8.poolTypes) {
      return;
    }

    if (!window.n8.wagerCreds || !window.n8.wagerCreds.poolTypesUrl) {
      setTimeout(initializePoolTypes, 100);

      return;
    }

    console.debug('Fetching pool types...');

    $.getJSON(window.n8.wagerCreds.poolTypesUrl, onSuccess);

    function onSuccess(data) {
      console.debug('... pool types received.')
      window.n8.poolTypes = data.PoolTypes;
    }
  }

  function initalizeTracks(force) {
    if (window.n8.tracks && !force) {
      return;
    }

    if (!window.n8.wagerCreds || !window.n8.wagerCreds.trackListUrl) {
      setTimeout(initalizeTracks, 100);

      return;
    }

    console.debug('Fetching track list...');

    $.getJSON(window.n8.wagerCreds.trackListUrl, onSuccess);

    function onSuccess(data) {
      console.debug('... track list received.')
      window.n8.tracks = data.Tracks;
    }
  }

  function refreshRaceResults() {
    var callbackFns = [];
    var tracks = _.map(window.n8.wagers || [], function(w) {
      return window.n8.tracks.find(function(t) { return t.EventCode === w.eventCode; }).BrisCode;
    });

    tracks = _.uniq(tracks);

    if (!tracks.length) {
      return;
    }

    console.debug('Refreshing race results...', tracks);
    tracks.forEach(function(tr) {
      var track = window.n8.tracks.find(function(t) { return t.BrisCode === tr; });
      callbackFns.push(function(cb) {
        getRaceResults(track, cb);
      });
    });

    async.parallel(callbackFns, onComplete);

    function onComplete(err, results) {
      console.debug('... race results received.', results);

      if (err) {
        return;
      }

      pushRaceResults(results);
    }
  }

  function refreshControlData() {
    refresh(); // on start, fire immediately

    setInterval(refresh, 1000 * 5);

    function refresh() {
      // console.debug('Refreshing control data...');

      window.n8.user = getUserInfo();

      if (window.__wagerCreds) {
        var wc = window.__wagerCreds;
        var uc = Cdi.AppConfig.WS;

        window.n8.wagerCreds = wc;

        window.n8.wagerCreds.wagersUrl = '/php/fw/php_BRIS_BatchAPI/2.3/Rtb/GetData?'
          + '&username=' + wc.USERNAME
          + '&password=' + wc.PASSWORD
          + '&ip=' + wc.CDI_CLIENT_IP
          + '&affid=' + wc.CDI_SAID
          + '&affiliateId=' + wc.CDI_SAID
          + '&account=' + window.n8.user.accountNum
          + '&authKey=' + window.n8.user.authKey
          + '&output=json'
          + '&limit=200'
          + '&cb='
          + (new Date()).getTime().toString()
          ;

        window.n8.wagerCreds.poolTypesUrl = '/php/fw/php_BRIS_BatchAPI/2.3/Tote/PoolTypes?'
          + '&username=' + wc.USERNAME
          + '&password=' + wc.PASSWORD
          + '&ip=' + wc.CDI_CLIENT_IP
          + '&affid=' + wc.CDI_SAID
          + '&affiliateId=' + wc.CDI_SAID
          + '&output=json'
          + '&cb='
          + (new Date()).getTime().toString()
          ;

        window.n8.wagerCreds.trackListUrl = '/php/fw/php_BRIS_BatchAPI/2.3/Cdi/TrackList?multisource=1&vidType=FLV'
          + '&username=' + uc.USERNAME
          + '&password=' + uc.PASSWORD
          + '&ip=' + uc.CDI_CLIENT_IP
          + '&affid=' + uc.CDI_SAID
          + '&output=json'
          + '&cb='
          + (new Date()).getTime().toString()
          ;
      }
    }
  }

  function getTracks() {
    var $tracks = $('body').find('.clsTrackName');
    var tracks = [];

    $tracks.each(function(index, t) {
      var $t = $(t);
      var track = {};

      track.name = $t.text();
      track.id = $t.attr('id').split('_')[1];
      track.type = $t.attr('id').split('_')[2];

      tracks.push(track);
    });

    window.tracks = tracks;

    return tracks;
  }

  function getUserInfo() {
    var obj = JSON.parse(sessionStorage.getItem('GlobalData'));

    if (obj) {
      var key = Object.keys(obj)[0];

      return obj[key];
    }

    return {};
  }

  function readCookie(name) {

    return (name = new RegExp('(?:^|;\\s*)' + ('' + name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)').exec(document.cookie)) && name[1];
  }

  function updateSyncButton(isSyncing) {
    var $btn = $('body').find('#syncButton');
    var $span = $btn.find('span');
    var $indicator = $btn.find('div');

    $btn.removeAttr('disabled');

    if (isSyncing) {
      $span.text('Sync: ON')
      $indicator.addClass('on');
      console.debug('Started syncing wagers...');
    }
    else {
      $span.text('Sync: OFF');
      $indicator.removeClass('on');
      console.debug('Stopped syncing wagers.');
    }
  }

  function toggleSync() {
    var isSyncing = window.n8.isSyncing = !window.n8.isSyncing;

    updateSyncButton(isSyncing);

    if (!isSyncing) {
      clearInterval(window.__wagerInterval);
      clearInterval(window.__allWagersInterval);
      clearInterval(window.__resultsInterval);
      clearTimeout(window.__nowAllWagers);
      clearTimeout(window.__nowRefreshRaceResults);

      PubNub.unsubscribe({
        channel: WAGER_DIFF_CHANNEL
      });

      window.n8.hasSyncedBefore = false;

      return;
    }

    var threeSeconds = 1000 * 3;
    var fiveSeconds = 1000 * 5;
    var thirtySeconds = 1000 * 30;
    var twoMinutes = 1000 * 60 * 2;

    PubNub.subscribe({
      channel: WAGER_DIFF_CHANNEL,
      'subscribe_key': '{{pubsub_subscribe_key}}',
      state: {
        user: window.n8.user
      }
    });

    window.__wagerInterval = setInterval(diffWagers, threeSeconds);
    window.__allWagersInterval = setInterval(allWagers, twoMinutes);
    window.__resultsInterval = setInterval(refreshRaceResults, thirtySeconds);

    // Fire near now the first go round
    window.__nowAllWagers = setTimeout(allWagers, threeSeconds);
    window.__nowRefreshRaceResults = setTimeout(refreshRaceResults, fiveSeconds);

    function diffWagers() {
      $.getJSON(window.n8.wagerCreds.wagersUrl, function(data) {
        onWagersReturned(data);
      });
    }

    function allWagers() {
      $.getJSON(window.n8.wagerCreds.wagersUrl, function(data) {
        onWagersReturned(data, true);
      });
    }

    function onWagersReturned(data, forceSendAll) {
      var wagers = data.Wagers;

      if (window.n8.hasSyncedBefore && !forceSendAll) {
        wagers = _.differenceWith(data.Wagers, window.n8.wagers, _.isEqual);
      }

      pushWagers(wagers, window.n8.hasSyncedBefore);

      window.n8.wagers = data.Wagers;
      window.n8.hasSyncedBefore = true;
    }
  }

  function pushRaceResults(results) {
    var RESULTS_BULK_CHANNEL = 'results-all';
    var slimResults = [];
    var tracks = [];

    (results || []).forEach(function(result) {
      var track = {
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
        if (t.races.length === 0) {
          return;
        }

        console.debug('Pushing race results...', t);
        window.PubNub.publish({
          channel: RESULTS_BULK_CHANNEL,
          message: t
        });
      });

      window.n8.results = tracks;
    }
  }

  function pushWagers(wagers, isDiff) {
    if (!wagers || !wagers.length) {
      return;
    }

    var slimWagers = convertWagersToSlimObjects(wagers);

    if (!!isDiff) {
      console.debug('Pushing wagers diff...', slimWagers);
      window.PubNub.publish({
        channel: WAGER_ALL_CHANNEL,
        message: slimWagers
      });
    }
    else {
      console.debug('Pushing wagers bulk...', slimWagers);
      window.PubNub.publish({
        channel: WAGER_ALL_CHANNEL,
        message: slimWagers
      });
    }
  }

  function convertWagersToSlimObjects(wagers) {
    if (!wagers || !window.n8.poolTypes || !window.n8.poolTypes.length) {
      return [];
    }

    return wagers.map(function(w) {
      var offsetTime = 1000 * 10; // Their server times are a few seconds slow
      var newWager = {};

      newWager.timestamp = moment.tz(w.placedDate, 'America/Los_Angeles').toDate().getTime() - offsetTime; // Wager dates are local to America/Los_Angeles
      newWager.id = w.serialNumber;
      newWager.user = _.pick(window.n8.user, ['email', 'firstName', 'lastName']);
      newWager.betAmount = parseFloat(w.totalCost, 10);
      newWager.payoutAmount = parseFloat(w.payoutAmount, 10);
      newWager.type = window.n8.poolTypes.find(function(pt) { return pt.Code === w.poolType; });
      newWager.selections = w.runnersList;
      newWager.race = {id: w.race};
      newWager.track = window.n8.tracks.find(function(t) { return t.EventCode === w.eventCode; });
      newWager.eventCode = newWager.track.EventCode;
      newWager.status = w.status;
      newWager.refundAmount = w.refundAmount;

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
    callback = typeof callback === 'function' ? callback : function() {};

    var lookups = {
      'thoroughbred': 1,
      'harness': 2
    };

    var url = '/secure-bin/results_tracks.cgi?track=' + track.BrisCode + '&race=all&type=' + lookups[track.TrackType.toLowerCase()];

    console.debug('Fetching race results...', url);

    $.get(url, function onSuccess(html) {
      var data = parseResultsToJson(html) || {};

      data.track = {
        BrisCode: track.BrisCode
      };

      return callback(null, data);
    });
  }

  function parseResultsToJson(html) {
    if ($('.data_hl').length) {
      return null; // No results data
    }

    var data = {races: []};
    var $wpsTbls = $(html).find('.toteboard:even');
    var $exTbls = $(html).find('.toteboard:odd');

    $wpsTbls.each(function(i, tbl) {
      var $tbl = $(tbl);
      var $xbl = $($exTbls[i]);
      var race = {
        id: i + 1,
        wps: [],
        exotics: []
      };

      var $rows = $tbl.find('tr:gt(1)');

      if ($rows.length === 0) {
        return null; // No results data
      }

      $rows.each(function(j, row) {
        var $row = $(row);
        var payout = {
          place: j + 1
        };

        var winAmountDisplay = $row.find('td:eq(1)').text().replace(/^[\.]$/ig, '');
        var placeAmountDisplay = $row.find('td:eq(2)').text().replace(/^[\.]$/ig, '');
        var showAmountDisplay = $row.find('td:eq(3)').text().replace(/^[\.]$/ig, '');

        payout.horse = $row.find('td:eq(0)').text();
        payout.winAmount = parseFloat(winAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;
        payout.placeAmount = parseFloat(placeAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;
        payout.showAmount = parseFloat(showAmountDisplay.replace(/[^0-9\.]+/ig, ''), 0) || 0;

        race.wps.push(payout);
      });

      var $xRows = $xbl.find('tr:gt(1)');

      $xRows.each(function(k, row) {
        var $row = $(row);

        var payout = {};

        var wagerType = $row.find('td:eq(0)').text().trim();
        var winAmountDisplay = $row.find('td:eq(2)').text().trim();

        payout.type = wagerType.replace(/[\$0-9\. ]/ig, '');
        payout.denomination = parseFloat(wagerType.replace(/[^0-9\.]/ig, ''), 0) || 0;
        payout.winCombo = $row.find('td:eq(1)').text().split('/');
        payout.winAmount = parseFloat(winAmountDisplay.replace(/[^0-9\.]/ig, ''), 0) || 0;

        race.exotics.push(payout);
      });

      data.races.push(race);
    })

    return data;
  }
})();

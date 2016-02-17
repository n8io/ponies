(function() {
  const pwnies = {
    tick: 0,
    toc: 30,
    closedTrackBrisCodes: []
  };
  const WAGERS_CHANNEL = 'v2-wagers';
  // const MESSAGE_TYPE_TRACK_RESULTS = 'trackResults';
  // const MESSAGE_TYPE_WAGERS = 'wagers';
  const FIREBASE_BASE_URI = '{{firebase_base_uri}}';
  const isMobile = window.location.href.toLowerCase().indexOf('//m.twinspires.com') > -1; // eslint-disable-line
  const RACE_STATUSES = {
    CLOSED: 'CLOSED',
    CANCELED: 'CANCELED'
  };
  const FINISHED_STATUSES = [RACE_STATUSES.CLOSED, RACE_STATUSES.CANCELED];
  let trackDaysRef;
  let trackDayRef;
  // const sevenSeconds = 1000 * 7;
  // const thirtySeconds = 1000 * 30;
  // const oneMinute = 1000 * 30;

  init();

  function init() {
    if (window.pwnies) { // eslint-disable-line
      console.warn('Pownies script already loaded. I ain\'t gonna do shit.'); // eslint-disable-line

      return;
    }

    window.pwnies = true; // eslint-disable-line

    clearConsole()
      .then(() => injectElements())
      .then(() => clearConsole())
      .then(() => initializeControlData())
      .then(() => initializePoolTypes())
      .then(() => initalizeTracks())
      .then(() => initializePubNub())
      .then(() => initFirebase())
      .then(() => firebaseUpsertPoolTypes(pwnies.poolTypes))
      .then(() => firebaseUpsertTracks(pwnies.tracks))
      .then(() => console.log(`Finished initialization.`, pwnies)) // eslint-disable-line
      .then(() => clearConsole())
      .then(() => wagerCheckingStart())
      ;
  }

  function clearConsole() {
    return new Promise(function(resolve) {
      console.clear(); // eslint-disable-line

      return resolve();
    });
  }

  function injectElements() {
    const scripts = [
      '//cdn.pubnub.com/pubnub-3.7.18.min.js',
      '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js',
      '//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.min.js',
      '//cdn.firebase.com/js/client/2.4.0/firebase.js'
    ];

    return Promise
      .all(getScriptLoadPromises(scripts)) // Load scripts
      .then(() => { // Load moment timezone
        const momentWithTZ = '//cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.0/moment-timezone-with-data-2010-2020.min.js';

        return Promise.all(getScriptLoadPromises(momentWithTZ));
      })
      .then(() => { // Do everything else
        injectCss();
        injectSyncToggle();

        return injectIFrame();
      })
      ;

    function injectCss() {
      const css = `
        <style id='css-sync'>
          .noshow {display:none;height:0;width:0;}
          #syncButton {position:fixed;bottom:22px;right:25px;z-index:99999;height:33px;width:105px;
            border-radius:3px;border:1px solid rgba(255,255,255, .4);background-color:#5196D4;color:#fff}
          #syncButton:disabled {background-color: #ccc; color: #777}
          #syncButton div {height:14px;width:14px;border-radius:14px;background-color:#ddd;margin-right:10px;float:right;}
          #syncButton div.on {background-color:#4BBA4B;}
          ${isMobile ? `#syncButton {top:111px;right: 18px;}` : ``}
        </style>
      `;

      $('body').append(css); // eslint-disable-line
    }

    function injectSyncToggle() {
      const button = $('<button id="syncButton" disabled><span>Sync: --</span><div class=""></div></button>'); // eslint-disable-line

      button.on('click', () => {
        toggleSync();
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

      console.debug(`Waiting (3 sec) for iframe to initialize...`); // eslint-disable-line

      return new Promise(function(resolve) {
        setTimeout(() => { // eslint-disable-line
          pwnies.user = getUserInfo();
          pwnies.wagerCreds = $('#iWager')[0].contentWindow.Cdi.AppConfig.WS; // eslint-disable-line

          console.debug(`... iframe creds found.`); // eslint-disable-line

          return resolve();
        }, 3000);
      });
    }

    function getScriptLoadPromises(scripts) {
      scripts = typeof scripts === 'string' ? [scripts] : scripts; // eslint-disable-line

      return scripts.map(function(src) {
        return new Promise(function(resolve, reject) {
          const s = document.createElement('script'); // eslint-disable-line

          document.getElementsByTagName('head')[0].appendChild(s); // eslint-disable-line

          s.onload = () => resolve();
          s.onerror = () => reject();
          s.src = src;
        });
      });
    }
  }

  function initializeControlData() {
    const uc = Cdi.AppConfig.WS; // eslint-disable-line
    const wc = pwnies.wagerCreds;
    const baseUrl = `https://${isMobile ? `m` : `www`}.twinspires.com`;

    pwnies.wagerCreds.wagersUrl = `${baseUrl}/php/fw/php_BRIS_BatchAPI/2.3/Rtb/GetData?` // eslint-disable-line
        + `&username=${wc.USERNAME}`
        + `&password=${wc.PASSWORD}`
        + `&ip=${wc.CDI_CLIENT_IP}`
        + `&affid=${wc.CDI_SAID}`
        + `&affiliateId=${wc.CDI_SAID}`
        + `&account=${pwnies.user.accountNum}`
        + `&authKey=${pwnies.user.authKey}`
        + `&output=json`
        + `&limit=200`
        ;

    pwnies.wagerCreds.poolTypesUrl = `${baseUrl}/php/fw/php_BRIS_BatchAPI/2.3/Tote/PoolTypes?` // eslint-disable-line
      + `&username=${wc.USERNAME}`
      + `&password=${wc.PASSWORD}`
      + `&ip=${wc.CDI_CLIENT_IP}`
      + `&affid=${wc.CDI_SAID}`
      + `&affiliateId=${wc.CDI_SAID}`
      + `&output=json`
      ;

    pwnies.wagerCreds.trackListUrl = `${baseUrl}/php/fw/php_BRIS_BatchAPI/2.3/Cdi/TrackList?multisource=1&vidType=FLV` // eslint-disable-line
      + `&username=${uc.USERNAME}`
      + `&password=${uc.PASSWORD}`
      + `&ip=${uc.CDI_CLIENT_IP}`
      + `&affid=${uc.CDI_SAID}`
      + `&output=json`
      ;

    pwnies.wagerCreds.resultUrl = `${baseUrl}/secure-bin/results_tracks.cgi?`
        + `&race=all`
        ;

    pwnies.wagerCreds.programUrl = `${baseUrl}/php/fw/php_BRIS_BatchAPI/2.3/Pgm/Entry?` // eslint-disable-line
      + `&username=${uc.USERNAME}`
      + `&password=${uc.PASSWORD}`
      + `&ip=${uc.CDI_CLIENT_IP}`
      + `&affid=${uc.CDI_SAID}`
      + `&output=json`
      ;

    pwnies.wagerCreds.oddsUrl = `${baseUrl}/php/fw/php_BRIS_BatchAPI/2.3/Tote/OddsMtpPost?` // eslint-disable-line
      + `&username=${uc.USERNAME}`
      + `&password=${uc.PASSWORD}`
      + `&ip=${uc.CDI_CLIENT_IP}`
      + `&affid=${uc.CDI_SAID}`
      + `&output=json`
      ;

    return pwnies;
  }

  function initializePoolTypes() {
    return new Promise(function(resolve) {
      console.debug('Fetching pool types...', pwnies.wagerCreds.poolTypesUrl); // eslint-disable-line

      $.getJSON(pwnies.wagerCreds.poolTypesUrl, function(data) {
        console.debug('... pool types received.', data.PoolTypes); // eslint-disable-line

        pwnies.poolTypes = data.PoolTypes;

        return resolve(data.PoolTypes);
      });
    });
  }

  function initalizeTracks() {
    return new Promise(function(resolve) {
      console.debug(`Fetching track list...`, pwnies.wagerCreds.trackListUrl); // eslint-disable-line

      $.getJSON(pwnies.wagerCreds.trackListUrl, function(data) {
        console.debug(`... track list received.`, data.Tracks); // eslint-disable-line

        pwnies.tracks = slimTracks(data.Tracks);

        return resolve();
      });
    });
  }

  function initializePubNub() {
    return new Promise(function(resolve) {
      console.debug(`Initing PubNub...`); // eslint-disable-line

      return resolve(PUBNUB.init({ // eslint-disable-line
        'publish_key': '{{pubsub_publish_key}}',
        'subscribe_key': '{{pubsub_subscribe_key}}',
        heartbeat: 60, // timeout in 1min if I leave
        ssl: window.location.protocol.indexOf('s') > -1, // eslint-disable-line
        uuid: pwnies.user.email
      }));
    })
    .then(function(pubNubInstance) {
      console.debug(`PubNub initialized.`); // eslint-disable-line

      pwnies.PubNub = pubNubInstance;

      $(window).bind('unload',() => { // eslint-disable-line
        pwnies.isSyncing = false; // eslint-disable-line

        pwnies.PubNub.state({
          channel: WAGERS_CHANNEL,
          state: getUserInfoSlim(),
          callback: () => 0,
          error: () => 0
        });
      });

      return new Promise(function(resolve) {
        pwnies.PubNub.subscribe({
          channel: WAGERS_CHANNEL,
          message: () => 0,
          state: getUserInfoSlim(),
          connect: () => {
            console.debug(`Successfully subscribed to ${WAGERS_CHANNEL} channel.`); // eslint-disable-line

            return resolve(pwnies.PubNub);
          }
        });
      });
    })
    ;
  }

  function initFirebase() {
    const trackDaysUri = `${FIREBASE_BASE_URI}/trackDays`;

    trackDaysRef = new Firebase(trackDaysUri);

    console.debug(`Retrieving today's track day data...`, `${trackDaysUri}/${getTodaysTrackDayKey()}`); // eslint-disable-line

    trackDayRef = trackDaysRef.child(getTodaysTrackDayKey());

    return new Promise((resolve, reject) => {
      trackDayRef.on('value', resolve, reject);
    });
  }

  function toggleSync() {
    pwnies.isSyncing = !pwnies.isSyncing;

    if (pwnies.isSyncing) {
      wagerCheckingStart();
    }
    else {
      wagerCheckingStop();
    }
  }

  function wagerCheckingStop() {
    pwnies.isSyncing = false;
    pwnies.tick = 0;

    if (!pwnies.timeouts) {
      pwnies.timeouts = {};
    }

    if (pwnies.timeouts.wc) {
      clearTimeout(pwnies.timeouts.wc);
    }

    setSyncState(pwnies.isSyncing);
    updateSyncButton(pwnies.isSyncing);
  }

  function wagerCheckingStart() {
    pwnies.isSyncing = true;

    clearConsole()
      .then(() => {
        updateSyncButton(pwnies.isSyncing);
        pwnies.closedTrackBrisCodes = [];
        processWagers(true);
      });
  }

  function processWagers(forceSendAllTracks) {
    getWagersPromise()
      .then((wagers) => {
        wagers.sort(function(a, b) {
          return a.timestamp - b.timestamp;
        });

        pwnies.wagers = wagers.concat();

        console.debug(`Wagers data retrieved.`, wagers); // eslint-disable-line

        return wagers;
      })
      .then(() => getUniqueTracksPromise(pwnies.wagers))
      .then((tracks) => {
        tracks = tracks.filter((t) => pwnies.closedTrackBrisCodes.indexOf(t.BrisCode.toUpperCase()) === -1);

        return getTracksMtpPromise(tracks);
      })
      .then((tracks) => firebaseUpsertMtps(tracks))
      .then((tracks) => getAllTrackResultsPromise(tracks, pwnies.wagers))
      .then((allTrackResults) => {
        // allTrackResults = [ { races: ..., track: ... }]
        let tracks = slimDownTracksToOnlyThoseWithWagers(allTrackResults, pwnies.wagers, forceSendAllTracks);

        tracks = padTrackRacesWithWagers(tracks, pwnies.wagers, forceSendAllTracks);

        return getAllTracksProgramInfo(tracks);
      })
      .then((tracks) => getAllTracksOddsInfo(tracks))
      .then((tracks) => firebaseUpsertTrackDay(tracks))
      .then(() => {
        if (forceSendAllTracks) {
          setSyncState(pwnies.isSyncing);
        }

        // Go do it all again
        if (!pwnies.timeouts) {
          pwnies.timeouts = {};
        }

        if (pwnies.timeouts.wc) {
          clearTimeout(pwnies.timeouts.wc);
        }

        if (pwnies.isSyncing) {
          pwnies.timeouts.wc = setTimeout(processWagers, 1000 * 5); // Fire off again in three seconds
        }

        return 0;
      })
      .then((tracks) => pwnies.slimTracks = tracks)
      ;
  }

  function firebaseUpsertPoolTypes(poolTypes) {
    const poolTypesUri = `${FIREBASE_BASE_URI}/pooltypes`;
    const poolTypesRef = new Firebase(poolTypesUri);

    console.debug(`Retrieving current pool types...`, poolTypesUri); // eslint-disable-line

    return new Promise((resolve) => {
      poolTypes.forEach((pt) => {
        poolTypesRef.child(pt.Code).transaction((existingPoolType) => {
          if (!existingPoolType) {
            return pt;
          }
        });
      });

      return resolve();
    });
  }

  function firebaseUpsertTracks(tracks) {
    const tracksUri = `${FIREBASE_BASE_URI}/tracks`;
    const tracksRef = new Firebase(tracksUri);

    console.debug(`Retrieving current tracks...`, tracksUri); // eslint-disable-line

    return Promise.all(tracks.map((t) => tracksRef.child(t.BrisCode).update(t)));
  }

  function firebaseUpsertTrackDay(tracks) {
    return Promise
      .all(getAllTrackRefsPromises(tracks))
      .then(() => Promise.all(getAllTrackNextRaceRefsPromises(tracks)))
      .then(() => Promise.all(getAllTrackRacesPromises(tracks)))
      .then(() => {
        // After everything is sent once, lets identify the tracks that are closed
        tracks.forEach((t) => {
          // Let's make sure closed tracks don't get updated anymore
          if (FINISHED_STATUSES.indexOf(t.nextRace.Status.toUpperCase()) > -1) {
            if (pwnies.closedTrackBrisCodes.indexOf(t.BrisCode) === -1) {
              console.debug(`${t.BrisCode} seems to be closed. Adding it to the finished track list.`); // eslint-disable-line

              pwnies.closedTrackBrisCodes.push(t.BrisCode.toUpperCase());
            }
          }
        });
      })
      ;
  }

  function firebaseUpsertMtps(tracks) {
    const promises = tracks
      .filter((t) => pwnies.closedTrackBrisCodes.indexOf(t.BrisCode.toUpperCase()) === -1) // Omitting closed tracks
      .map((t) => new Promise((resolve) => {
        trackDayRef.child(t.BrisCode).child(`nextRace`).update(slimNextRace(t.nextRace));

        return resolve(t);
      }))
      ;

    console.debug(`Upserting nextRace information...`, tracks); // eslint-disable-line

    return Promise.all(promises);
  }

  /* START Firebase persistence */

  function getAllTrackRacesPromises(tracks) {
    return tracks.map((t) => {
      t.races.map((r) => {
        getTrackRacesPromise(t, r)
          .then(() => {
            // Update horse metadata
            const horsesPromises = r.horses.map((h) =>
              trackDayRef.child(t.BrisCode).child(`races/${padLeft(r.id, 3)}/horses/${padLeft(h.id, 3)}`).update(slimHorse(h))
            );

            return Promise.all(horsesPromises);
          })
          .then(() => {
            // Update horse odds
            const oddsPromises = r.horses.map((h) =>
              trackDayRef.child(t.BrisCode).child(`races/${padLeft(r.id, 3)}/horses/${padLeft(h.id, 3)}/odds`).update(h.odds)
            );

            return Promise.all(oddsPromises);
          })
          .then(() => {
            // Update wagers
            const wagerPromises = r.wagers.map((w) =>
              trackDayRef.child(t.BrisCode).child(`races/${padLeft(r.id, 3)}/wagers/${w.id}`).update(superSlimWager(w))
            );

            return Promise.all(wagerPromises);
          })
          .then(() => tracks)
          ;
      });

      return t;
    });
  }

  function getTrackRacesPromise(track, race) {
    return trackDayRef.child(track.BrisCode).child(`races/${padLeft(race.id, 3)}`).update(_.pick(race, [
      'id',
      'CorrectedPostTime',
      'metadata',
      'results'
    ]));
  }

  function getAllTrackNextRaceRefsPromises(tracks) {
    return tracks.map((track) => trackDayRef.child(track.BrisCode).update({nextRace: track.nextRace}));
  }

  function getAllTrackRefsPromises(tracks) {
    return tracks.map((track) => {
      const sTrack = _.pick(track, [
        'BrisCode',
        'DisplayName',
        'EventCode',
        'TrackType'
      ]);

      return trackDayRef.child(track.BrisCode).update(sTrack);
    });
  }

  /* END Firebase persistence  */

  function getWagersPromise() {
    return new Promise(function(resolve) {
      const cb = `&cb=${(new Date()).getTime()}`;

      $.getJSON(pwnies.wagerCreds.wagersUrl + cb, function(data) {
        return resolve(slimWagers((data.Wagers || [])));
      });
    });
  }

  function getUniqueTracksPromise(wagers) {
    console.debug(`Consolidating to unique tracks by current wagers...`, wagers); // eslint-disable-line

    return new Promise(function(resolve) {
      const uniqTracks = [];
      const tracks = wagers.map(function(w) {
        return pwnies.tracks.find(function(t) {
          return t.BrisCode === w.BrisCode;
        });
      });

      tracks.forEach(function(t) {
        const uTrack = uniqTracks.find(function(u) {
          return t.BrisCode === u.BrisCode;
        });

        if (!uTrack) {
          uniqTracks.push(t);
        }
      });

      return resolve(uniqTracks);
    });
  }

  function getAllTracksOddsInfo(tracks) {
    const promises = tracks.map(getTrackOddsInfoPromise);

    return Promise.all(promises);
  }

  function getTrackOddsInfoPromise(track) {
    const promises = track
      .races
      .filter((r) => r.wagers && r.wagers.length)
      .map((r) => getTrackRaceOddsInfoPromise(track, r))
      ;

    return Promise
      .all(promises)
      .then((races) => {
        track.races = races;

        return track;
      })
      ;
  }

  function getTrackRaceOddsInfoPromise(track, race) {
    const url = `${pwnies.wagerCreds.oddsUrl}&track=${track.BrisCode}&type=${track.TrackType}&race=${race.id}`;

    return new Promise(function(resolve) {
      console.debug(`Retrieving ${track.BrisCode} track odds info...`, url); // eslint-disable-line

      $.getJSON(url, function(data) { // eslint-disable-line
        console.debug(`...returned ${track.BrisCode} track odds info.`, data.WinOdds.Entries); // eslint-disable-line

        race.horses = race.horses.map(function(h) {
          h.odds = data.WinOdds.Entries.find(function(odds) {
            return h.ProgramNumber === odds.ProgramNumber;
          });

          h.odds = _.omit(h.odds, 'ProgramNumber');

          h.odds.NumOdds = parseFloat(h.odds.NumOdds, 10);
          h.odds.TextOdds = h.odds.TextOdds.trim();

          return h;
        });

        return resolve(race);
      });
    });
  }

  function getAllTracksProgramInfo(tracks) {
    const promises = tracks.map(getTrackProgramInfoPromise);

    return Promise.all(promises);
  }

  function getTrackProgramInfoPromise(track) {
    const url = `${pwnies.wagerCreds.programUrl}&track=${track.BrisCode}&type=${track.TrackType}`;

    return new Promise(function(resolve) {
      console.debug(`Retrieving ${track.BrisCode} track program info...`, url); // eslint-disable-line

      $.getJSON(url, function(data) { // eslint-disable-line
        console.debug(`...returned ${track.BrisCode} track program info.`, data.ProgramTracks[0]); // eslint-disable-line

        track.conditions = data.ProgramTracks[0].Conditions;
        track.races.forEach(function(r) {
          const foundRace = data.ProgramTracks[0].Races.find(function(pr) {
            return r.id === parseInt(pr.RaceNum, 0);
          });

          if (foundRace) {
            if (foundRace.CorrectedPostTime) {
              r.CorrectedPostTime = moment(foundRace.CorrectedPostTime).tz('America/New_York').toDate().getTime(); // eslint-disable-line
            }

            r.metadata = _.pick(foundRace, [
              'AgeText',
              'Distance',
              'ShortDistance',
              'Yards',
              'Purse',
              'SurfaceText'
            ]);

            r.horses = foundRace.Horses.map(function(h) {
              const horse = _.pick(h, [
                'ProgramNumber',
                'PostPosition',
                'ML',
                'HorseName',
                'Weight',
                'Sex'
              ]);

              horse.id = parseInt(horse.ProgramNumber, 10);
              horse.PostPosition = parseInt(horse.PostPosition, 10);

              return horse;
            });
          }

          return r;
        });

        return resolve(track);
      });
    });
  }

  function getAllTrackResultsPromise(tracks) {
    const promises = tracks.map(getTrackResultsPromise);

    return Promise.all(promises);
  }

  function getTrackResultsPromise(track) {
    const lookups = {
      'thoroughbred': 1,
      'harness': 2
    };
    const url = `${pwnies.wagerCreds.resultUrl}&track=${track.BrisCode}&type=${lookups[track.TrackType.toLowerCase()]}`;

    return new Promise(function(resolve) {
      console.debug(`Retrieving ${track.BrisCode} track results...`, url); // eslint-disable-line

      $.get(url, function onSuccess(html) { // eslint-disable-line
        const data = parseResultsToJson(html) || {};

        console.debug(`...returned ${track.BrisCode} track results.`, data); // eslint-disable-line

        data.track = track;

        return resolve(data);
      });
    });
  }

  function getTracksMtpPromise(tracks) {
    const wc = pwnies.wagerCreds;

    return new Promise(function(resolve) {
      const url = `https://www.twinspires.com/php/fw/php_BRIS_BatchAPI/2.3/Tote/CurrentRace?`
        + `username=${wc.USERNAME}&password=${wc.PASSWORD}`
        + `&ip=${wc.CDI_CLIENT_IP}&affid=${wc.CDI_SAID}&output=json`;

      console.debug(`Retrieving MTP info...`, url); // eslint-disable-line

      $.get(url, function(data) {
        const mtps = data.CurrentRace;

        return resolve(tracks.map(function(t) {
          const mtp = mtps.find(function(m) {
            return t.BrisCode.toUpperCase() === m.BrisCode.toUpperCase();
          });

          mtp.postTimestamp = moment.tz(mtp.PostTime, 'America/New_York').toDate().getTime(); // eslint-disable-line
          mtp.firstPostTimestamp = moment.tz(mtp.FirstPostTime, 'America/New_York').toDate().getTime(); // eslint-disable-line

          t.nextRace = mtp;

          return t;
        }));
      });
    });
  }

  function setSyncState(isSyncing) {
    pwnies.PubNub.state({
      channel: WAGERS_CHANNEL,
      state: getUserInfoSlim(),
      callback: () => {
        if (isSyncing) {
          console.debug('Started syncing.') // eslint-disable-line
        }
        else {
          console.debug('Stopped syncing.') // eslint-disable-line
        }
      },
      error: () => 0
    });
  }

  function updateSyncButton(isSyncing, skipPause) {
    const $btn = $('body').find('#syncButton'); // eslint-disable-line
    const $span = $btn.find('span');
    const $indicator = $btn.find('div');

    if (isSyncing) {
      $span.text('Sync: ON');
      $indicator.addClass('on');
    }
    else {
      $span.text('Sync: OFF');
      $indicator.removeClass('on');
    }

    if (!skipPause) {
      $btn.attr('disabled', 'disabled');

      setTimeout(() => { // eslint-disable-line
        $btn.removeAttr('disabled');
      }, 750);
    }
    else {
      $btn.removeAttr('disabled');
    }
  }

  function slimTracks(tracks) {
    if (!tracks || !tracks.length) {
      return [];
    }

    return tracks.map(slimTrack);
  }

  function slimTrack(track) {
    if (!track) {
      return;
    }

    const newTrack = {
      BrisCode: track.BrisCode,
      DisplayName: track.DisplayName,
      TrackType: track.TrackType,
      EventCode: track.EventCode,
      DomesticTrack: track.DomesticTrack
    };

    if (track.nextRace) {
      newTrack.nextRace = slimNextRace(track.nextRace);
    }

    if (track.races) {
      newTrack.races = track.races;
    }

    return newTrack;
  }

  function slimHorse(horse) {
    if (!horse) {
      return;
    }

    return _.pick(horse, [
      'id',
      'HorseName',
      'ML',
      'PostPosition',
      'ProgramNumber',
      'Sex',
      'Weight'
    ]);
  }

  function slimRace(race) {
    if (!race) {
      return;
    }

    const newRace = {
      id: race.id
    };

    if (race.exotics && race.wps) {
      newRace.results = {
        exotics: race.exotics,
        wps: race.wps
      };
    }

    if (race.wagers) {
      newRace.wagers = race.wagers;
    }

    if (race.metadata) {
      newRace.metadata = race.metadata;
    }

    if (race.horses) {
      newRace.horses = race.horses;
    }

    return newRace;
  }

  function slimNextRace(nextRace) {
    if (!nextRace) {
      return;
    }

    const newNextRace = {
      Mtp: nextRace.Mtp,
      RaceNum: nextRace.RaceNum,
      RaceStatus: nextRace.RaceStatus,
      Status: nextRace.Status,
      firstPostTimestamp: nextRace.firstPostTimestamp,
      postTimestamp: nextRace.postTimestamp
    };

    return newNextRace;
  }

  function slimWagers(wagers) {
    if (!wagers || !wagers.length) {
      return [];
    }

    return wagers.map(slimWager);
  }

  function slimWager(wager) {
    const offsetTime = 1000 * 10; // Their server times are a few seconds slow

    if (!wager) {
      return;
    }

    const newWager = {};

    newWager.timestamp = moment.tz(wager.placedDate, 'America/Los_Angeles').toDate().getTime() - offsetTime; // eslint-disable-line
    newWager.id = wager.serialNumber;
    newWager.user = _.pick(pwnies.user, ['email', 'firstName', 'lastName', 'accountNum']); // eslint-disable-line
    newWager.betAmount = parseFloat(wager.totalCost, 10);
    newWager.payoutAmount = parseFloat(wager.payoutAmount, 10);
    newWager.poolType = wager.poolType;
    newWager.poolTypeName = pwnies.poolTypes.find((pt) => pt.Code === newWager.poolType).Name;
    newWager.selections = wager.runnersList;
    newWager.race = wager.race;
    newWager.BrisCode = pwnies.tracks.find((t) => t.EventCode === wager.eventCode).BrisCode;
    newWager.eventCode = wager.eventCode;
    newWager.status = wager.status;
    newWager.refundAmount = wager.refundAmount;

    return newWager;
  }

  function superSlimWager(wager) {
    return _.pick(wager, [
      'id',
      'betAmount',
      'payoutAmount',
      'poolType',
      'poolTypeName',
      'refundAmount',
      'selections',
      'status',
      'timestamp',
      'user'
    ]);
  }

  function slimDownTracksToOnlyThoseWithWagers(fullTracks, wagers, force) {
    const tracks = fullTracks
      .filter((t) => {
        // Only wagers for the most recent race(s) and the current track
        const foundWagers = pwnies.closedTrackBrisCodes.indexOf(t.track.BrisCode.toUpperCase()) === -1
          && wagers.filter((w) => t.track.BrisCode === w.BrisCode && (force || t.track.nextRace.RaceNum <= w.race));

        return !!foundWagers.length;
      })
      .map((t) => {
        const track = slimTrack(t.track);
        const foundWagers = wagers.filter((w) => t.track.BrisCode === w.BrisCode);

        track.races = (t.races || [])
          .filter((r) => !!foundWagers.find((w) => t.track.BrisCode === w.BrisCode && w.race === r.id))
          .map((r) => {
            const newRace = {
              id: r.id,
              exotics: r.exotics,
              wps: r.wps
            };

            newRace.wagers = foundWagers.filter((w) => r.id === w.race);

            return slimRace(newRace);
          })
          ;

        return track;
      })
      ;

    return tracks;
  }

  function padTrackRacesWithWagers(tracks, wagers, force) {
    if (!tracks || !tracks.length) {
      return [];
    }

    if (!wagers || !wagers.length) {
      return [];
    }

    // Add missing tracks, races, wagers
    wagers
      .forEach((w) => {
        const foundTrack = tracks.length && tracks.find((t) => t.BrisCode === w.BrisCode);

        if (!foundTrack) {
          if (!force) {
            return; // Do nothing, we aren't adding tracks unless forced to
          }

          const newTrack = slimTrack(pwnies.tracks.find((t) => t.BrisCode === w.BrisCode));

          if (w.race < newTrack.nextRace.RaceNum) {
            return; // Don't add track, the race for this wager is in the past
          }

          newTrack.races = [
            {
              id: w.race,
              wagers: wagers.filter((wager) => w.BrisCode === wager.BrisCode && w.race === wager.race)
            }
          ];

          tracks.push(newTrack);

          return;
        }

        const foundRace = foundTrack.races
          && foundTrack.races.length
          && foundTrack.races.find((r) => w.BrisCode === foundTrack.BrisCode && w.race === r.id);

        if (!foundRace) {
          if (!foundTrack.races) {
            foundTrack.races = [];
          }

          foundTrack.races.push({
            id: w.race,
            wagers: wagers.filter((wager) => w.BrisCode === wager.BrisCode && w.race === wager.race)
          });

          return;
        }

        const foundWager = foundRace.wagers
          && foundRace.wagers.length
          && foundRace.wagers.find((wager) => wager.id === w.id);

        if (!foundWager) {
          if (!foundRace.wagers) {
            foundRace.wagers = [];
          }

          foundRace.wagers.push(w);

          return;
        }
      })
      ;

    return tracks;
  }

  function parseResultsToJson(html) {
    if ($('.data_hl').length) { // eslint-disable-line
      return null; // No results data
    }

    const data = {races: []};
    const $wpsTbls = $(html).find('.toteboard:even'); // eslint-disable-line
    const $exTbls = $(html).find('.toteboard:odd'); // eslint-disable-line

    $(html).find('th[colspan="4"] a,script').remove(); // eslint-disable-line

    const raceIds = [];
    const regex = /Race (\d+)/ig;

    $(html).find('th[colspan="4"]').each(function(index, th) { // eslint-disable-line
      const matches = $(th).text().match(regex); // eslint-disable-line

      raceIds.push(parseInt(matches[0].replace('Race ', ''), 0));
    });

    $wpsTbls.each(function(i, tbl) {
      const $tbl = $(tbl); // eslint-disable-line
      const $xbl = $($exTbls[i]); // eslint-disable-line
      const race = {
        id: raceIds[i],
        wps: [],
        exotics: []
      };

      const $rows = $tbl.find('tr:gt(1)');

      if ($rows.length === 0) {
        return null; // No results data
      }

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

  function getUserInfo() {
    const obj = JSON.parse(sessionStorage.getItem('GlobalData')); // eslint-disable-line

    if (obj) {
      const key = Object.keys(obj).find(function(key) {
        return key.indexOf('classic') > -1;
      });
      const user = obj[key];

      return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accountNum: user.accountNum,
        authKey: user.authKey,
        isSyncing: pwnies && pwnies.isSyncing
      };
    }

    console.error(`Could not get user info!`); // eslint-disable-line

    return {};
  }

  function getUserInfoSlim() {
    const data = getUserInfo();

    return {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      isSyncing: data.isSyncing
    };
  }

  function getTodaysTrackDayKey(localDate) {
    const now = moment(localDate).utc();
    const nowHour = now.hour();

    if (nowHour < 7 || (nowHour >= 7 && nowHour <= 10)) { // After 2AM ET and before 6AM ET (off hours)
      now.add(-1, 'd'); // Previous day
    }

    return `${now.format(`YYYYMMDD`)}`;
  }

  function padLeft(num, size) {
    return (`000000000${num}`).substr(-size);
  }

  // function pushDiffTrackResultsPromise(tracksBefore, tracksAfter, forceSendAllTracks) {
  //   return new Promise(function(resolve) {
  //     if (tracksAfter.length === 0) {
  //       console.debug(`No tracks to send. Doing nothing.`); // eslint-disable-line

  //       return resolve();
  //     }

  //     if (!forceSendAllTracks && !areTracksDifferent(tracksBefore, tracksAfter)) { // eslint-disable-line
  //       console.debug(`No changes to tracks. Nothing to do.`); // eslint-disable-line

  //       return resolve();
  //     }

  //     const chunks = _.chunk(tracksAfter, 3);

  //     chunks.forEach(function(trackResults) {
  //       const data = {};

  //       console.debug(`Sending track results...`, trackResults); // eslint-disable-line

  //       data[MESSAGE_TYPE_TRACK_RESULTS] = trackResults;
  //       pwnies.PubNub.publish({
  //         channel: WAGERS_CHANNEL,
  //         message: data,
  //         callback: resolve
  //       });
  //     });

  //     pwnies.tracksSent = tracksAfter;
  //   });
  // }

  // function pushDiffWagers(wagersBefore, wagersAfter, forceSendAllWagers) {
  //   return new Promise(function(resolve) {
  //     const data = {};
  //     let diffWagers = [];

  //     wagersBefore = wagersBefore.splice(0, 30); // Limit to 30 most recent
  //     wagersAfter = wagersAfter.splice(0, 30); // Limit to 30 most recent

  //     pwnies.PubNub.state({
  //       channel: WAGERS_CHANNEL,
  //       state: getUserInfoSlim(),
  //       callback: () => {},
  //       error: function() {}
  //     });

  //     if (!forceSendAllWagers && _.isEqual(wagersBefore, wagersAfter)) { // eslint-disable-line
  //       console.debug(`No changes to wagers. Nothing to do.`); // eslint-disable-line

  //       return resolve();
  //     }

  //     if (forceSendAllWagers) {
  //       setSyncState(pwnies.isSyncing);

  //       diffWagers = wagersAfter;

  //       console.debug(`Sending bulk wagers...`, diffWagers); // eslint-disable-line
  //     }
  //     else {
  //       wagersAfter.forEach(function(a) {
  //         const foundBW = wagersBefore.find(function(b) {
  //           return a.id === b.id;
  //         });

  //         if (!foundBW) {
  //           diffWagers.push(a); // Didn't find it, must be new
  //         }
  //         else if (!_.isEqual(a, foundBW)) { // eslint-disable-line
  //           diffWagers.push(a); // Found it, but has changed
  //         }
  //       });

  //       console.debug(`Sending diff wagers...`, diffWagers); // eslint-disable-line
  //     }

  //     const chunks = _.chunk(diffWagers, 5); // Break calls into manageable sizes

  //     chunks.forEach(function(chunk) {
  //       data[MESSAGE_TYPE_WAGERS] = chunk;

  //       pwnies.PubNub.publish({
  //         channel: WAGERS_CHANNEL,
  //         message: data,
  //         callback: function() {}
  //       });
  //     });

  //     return resolve();
  //   });
  // }

  // function areTracksDifferent(b, a) {
  //   if ((!a && b) || (a && !b)) {
  //     return true;
  //   }

  //   if (a.length !== b.length) {
  //     console.debug(`Differences were found in tracks lengths.`, {expected: a.length, a: a, actual: b.length, b: b}); // eslint-disable-line

  //     return true;
  //   }

  //   const aSorted = _.orderBy(a, function(t) {
  //     return t.BrisCode;
  //   });

  //   const bSorted = _.orderBy(b, function(t) {
  //     return t.BrisCode;
  //   });

  //   const isDiff = aSorted.find(function(at, aIndex) {
  //     const bt = bSorted[aIndex];

  //     if (at.races.length !== bt.races.length) {
  //       console.debug(`Differences were found in races length.`, {expected: at.races.length, actual: bt.races.length, racesA: at.races, racesB: bt.races}); // eslint-disable-line

  //       return true;
  //     }
  //     else if (!_.isEqual(at.nextRace, bt.nextRace)) {
  //       console.debug(`Differences were found in nextRaces.`, {expected: at.nextRace, actual: bt.nextRace}); // eslint-disable-line

  //       return true;
  //     }

  //     return false;
  //   });

  //   return !!isDiff;
  // }

  // function initializeWagerChecks() {
  //   console.debug(`Initializing wager check interval...`); // eslint-disable-line

  //   wagerCheckingStart();
  // }
})();

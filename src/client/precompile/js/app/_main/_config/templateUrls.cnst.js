(function() {
  'use strict';

  const baseUri = `/html`;
  const ext = `.tmpl.html`;
  const templateUrls = {
    EXOTIC_COMBOS: `${baseUri}/exoticCombos${ext}`,
    EXOTICS_TABLE: `${baseUri}/exoticsTable${ext}`,
    GRAVATAR: `${baseUri}/gravatar${ext}`,
    HORSE_MORNING_LINE: `${baseUri}/horseMorningLine${ext}`,
    HORSE_NUMBER: `${baseUri}/horseNumber${ext}`,
    HORSE_ODDS: `${baseUri}/horseOdds${ext}`,
    MTP: `${baseUri}/mtp${ext}`,
    PRESENCE: `${baseUri}/presence${ext}`,
    RACE: `${baseUri}/race${ext}`,
    SYNC_STATUS: `${baseUri}/syncStatus${ext}`,
    TAB_INDENTIFIER: `${baseUri}/tabIdentifier${ext}`,
    TRACK: `${baseUri}/track${ext}`,
    WAGER: `${baseUri}/wager${ext}`,
    WAGER_TIMESTAMP: `${baseUri}/wagerTimestamp${ext}`,
    WINNING_WAGER_DOTS: `${baseUri}/winningWagerDots${ext}`,
    WPS: `${baseUri}/wps${ext}`,
    WPS_BOTTOM_SHEET: `${baseUri}/wpsBottomSheet${ext}`,
    WPS_DETAILS: `${baseUri}/wpsDetails${ext}`
  };

  angular
    .module('app.constants')
    .constant('TemplateUrls', templateUrls)
    ;
})();

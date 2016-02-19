angular
  .module('app.filters')
  .filter('wpsSelections', wpsSelections)
  ;

/* @ngInject */
function wpsSelections() {
  return function(wps) {
    if (!wps) {
      return;
    }

    const first = wps[0];
    const second = wps[1];
    const third = wps[2];
    let str = '';

    if (first) {
      str += `${first.horse}`;
    }

    if (second) {
      str += `/${second.horse}`;
    }

    if (third) {
      str += `/${third.horse}`;
    }

    return str;
  };
}

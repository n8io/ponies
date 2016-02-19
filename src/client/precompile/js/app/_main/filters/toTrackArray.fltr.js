angular
  .module('app.filters')
  .filter('toTrackArray', toTrackArray)
  ;

/* @ngInject */
function toTrackArray(_) {
  return function(obj) {
    return _(obj).values().filter((o) => o && o.nextRace).value();
  };
}

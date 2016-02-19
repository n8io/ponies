angular
  .module('app.filters')
  .filter('toRaceArray', toRaceArray)
  ;

/* @ngInject */
function toRaceArray(_) {
  return function(obj) {
    return _(obj).values().filter((o) => o && o.id).value();
  };
}

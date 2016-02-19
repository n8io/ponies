angular
  .module('app.filters')
  .filter('toWagerArray', toWagerArray)
  ;

/* @ngInject */
function toWagerArray(_) {
  return function(obj) {
    return _(obj).values().filter((o) => o && o.id).value();
  };
}

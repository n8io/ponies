angular
  .module('app.filters')
  .filter('toArray', toArray)
  ;

/* @ngInject */
function toArray(_) {
  return function(obj) {
    return _(obj).values().value();
  };
}

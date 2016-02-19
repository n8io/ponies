angular
  .module('app.services')
  .factory('Mousetrap', mousetrap)
  ;

/* @ngInject */
function mousetrap() {
  return Mousetrap;
}

angular
  .module('app.services')
  .factory('_', lodashService)
  ;

/* @ngInject */
function lodashService() {
  return _;
}

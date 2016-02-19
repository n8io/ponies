angular
  .module('app.services')
  .factory('CryptoJs', cryptoService)
  ;

/* @ngInject */
function cryptoService() {
  return CryptoJS;
}

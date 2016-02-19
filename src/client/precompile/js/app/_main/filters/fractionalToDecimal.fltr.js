angular
  .module('app.filters')
  .filter('fractionalToDecimal', fractionalToDecimal)
  ;

/* @ngInject */
function fractionalToDecimal() {
  return function(val) {
    if (!val) {
      return -1;
    }

    return angular.isNumber(val) ? parseFloat(val, 0) : parseFraction(val);
  };

  function parseFraction(val) {
    const parts = val.trim().split('/');

    return parseFloat(parts[0], 0) / parseFloat(parts[1], 0);
  }
}

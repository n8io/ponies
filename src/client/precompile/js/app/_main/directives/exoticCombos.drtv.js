angular
  .module('app.directives')
  .directive('exoticCombos', exoticCombos)
  ;

/* @ngInject */
function exoticCombos(TemplateUrls) {
  return {
    scope: {
      exotic: '='
    },
    replace: true,
    restrict: 'E',
    templateUrl: TemplateUrls.EXOTIC_COMBOS
  };
}

// {
//   "type": "Pick-",
//   "denomination": 0.503,
//   "winCombo": [
//     "6",
//     "8,9",
//     "2 3 of 3"
//   ],
//   "winAmount": 47.05
// }

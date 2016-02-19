angular
  .module('app.directives')
  .directive('horseOdds', horseOdds)
  ;

/* @ngInject */
function horseOdds(TemplateUrls) {
  return {
    scope: {
      horse: '=',
      fractional: '='
    },
    templateUrl: TemplateUrls.HORSE_ODDS,
    replace: true,
    restrict: 'E'
  };
}

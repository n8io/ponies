angular
  .module('app.directives')
  .directive('horseMorningLine', horseMorningLine)
  ;

/* @ngInject */
function horseMorningLine(TemplateUrls) {
  return {
    scope: {
      horse: '=',
      fractional: '='
    },
    templateUrl: TemplateUrls.HORSE_MORNING_LINE,
    replace: true,
    restrict: 'E'
  };
}

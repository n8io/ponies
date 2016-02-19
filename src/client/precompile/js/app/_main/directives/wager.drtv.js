angular
  .module('app.directives')
  .directive('wager', wager)
  ;

/* @ngInject */
function wager(TemplateUrls) {
  return {
    scope: {
      wager: '='
    },
    templateUrl: TemplateUrls.WAGER,
    replace: true,
    restrict: 'E'
  };
}

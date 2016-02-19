angular
  .module('app.directives')
  .directive('exoticsTable', exoticsTable)
  ;

/* @ngInject */
function exoticsTable(TemplateUrls) {
  return {
    scope: {
      exotics: '='
    },
    replace: true,
    restrict: 'E',
    templateUrl: TemplateUrls.EXOTICS_TABLE
  };
}

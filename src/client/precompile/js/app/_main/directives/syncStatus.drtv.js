angular
  .module('app.directives')
  .directive('syncStatus', syncStatus)
  ;

/* @ngInject */
function syncStatus(TemplateUrls) {
  return {
    scope: {
      status: '='
    },
    templateUrl: TemplateUrls.SYNC_STATUS,
    replace: true,
    restrict: 'E'
  };
}

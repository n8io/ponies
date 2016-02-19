angular
  .module('app.directives')
  .directive('presence', presence)
  ;

/* @ngInject */
function presence(TemplateUrls) {
  return {
    scope: {
      presences: '=',
      me: '=myPresence'
    },
    templateUrl: TemplateUrls.PRESENCE,
    replace: true,
    restrict: 'E'
  };
}

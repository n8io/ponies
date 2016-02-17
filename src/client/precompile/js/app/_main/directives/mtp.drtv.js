(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('mtp', mtp)
    ;

  /* @ngInject */
  function mtp(TemplateUrls) {
    return {
      scope: {
        mtp: '='
      },
      replace: true,
      restrict: 'E',
      templateUrl: TemplateUrls.MTP
    };
  }
})();

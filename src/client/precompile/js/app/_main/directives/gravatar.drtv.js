(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('gravatar', gravatar)
    ;

  /* @ngInject */
  function gravatar(CryptoService, UtilityService) {
    return {
      restrict: 'E',
      scope: {
        email: '='
      },
      replace: true,
      template: '<img data-ng-src="//www.gravatar.com/avatar/{{emailHash}}?s={{size}}&r={{rating}}&d={{defaultImage}}" />',
      link: linkFn
    };

    /* @ngInject */
    function linkFn($scope, element, attrs) {
      $scope.size = parseInt(attrs.size, 0) || 80;
      $scope.defaultImage = attrs.default || 'mm';
      $scope.forceDefault = angular.isDefined(attrs.force);
      $scope.rating = attrs.rating || 'G';
      $scope.round = angular.isDefined(attrs.round);
      $scope.emailHash = CryptoService.MD5($scope.email).toString();

      if ($scope.round) {
        const forceInlineCss = angular.isDefined(attrs.inlineCss);

        if (forceInlineCss) {
          element[0].style.borderRadius = `${$scope.size}px`;
          element[0].style.height = `${$scope.size}px`;
          element[0].style.width = `${$scope.size}px`;
        }
        else {
          const uuid = UtilityService.uuid();
          const klass = `gravatar-${uuid}`;
          const styleEl = `
            <style>
              .${klass} {
                height: ${$scope.size}px;
                width: ${$scope.size}px;
                border-radius: ${$scope.size}px;
              }
            </style>
          `;

          element.addClass(klass);

          angular.element('body').append(styleEl);
        }
      }
    }
  }
})();

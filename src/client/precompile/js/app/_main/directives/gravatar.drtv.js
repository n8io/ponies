(function() {
  'use strict';

  angular
    .module('app.directives')
    .directive('gravatar', gravatar)
    ;

  /* @ngInject */
  function gravatar(CryptoService, UtilityService, D3Service) {
    return {
      restrict: 'E',
      scope: {
        email: '=',
        letter: '='
      },
      replace: true,
      template: '<img id="{{uuid}}" data-ng-src="//www.gravatar.com/avatar/{{emailHash}}?s={{size}}&r={{rating}}&d={{defaultImage}}" />',
      link: linkFn
    };

    /* @ngInject */
    function linkFn($scope, element, attrs) {
      $scope.uuid = UtilityService.uuid();
      $scope.class = `gravatar-${$scope.uuid}`;
      $scope.letter = (attrs.letter || '');
      $scope.size = parseInt(attrs.size, 0) || 80;
      $scope.defaultImage = attrs.default || 'mm';
      $scope.forceDefault = angular.isDefined(attrs.force);
      $scope.rating = attrs.rating || 'G';
      $scope.round = angular.isDefined(attrs.round);
      $scope.emailHash = CryptoService.MD5($scope.email).toString();

      element.bind('error', function() {
        const svg = angular.element(buildInitialLetterSvg($scope.letter, $scope.size, $scope.round));

        element.css('display', 'none'); // Hide broken image, replace with initial letter svg

        if ($scope.round) {
          svg.attr('class', $scope.class);
        }

        $(element).after(svg); // eslint-disable-line
      });

      if ($scope.round) {
        const styleEl = `
          <style>
            .${$scope.class} {
              height: ${$scope.size}px;
              width: ${$scope.size}px;
              border-radius: ${$scope.size}px;
              display: inline;
            }
          </style>
        `;

        element.addClass($scope.class);

        angular.element('body').append(styleEl);
      }
    }

    function buildInitialLetterSvg(initial, size, round) {
      const initialScale = 20;
      const scaledFontSize = `${parseInt(size / initialScale, 0) * 100}%`;
      const container = D3Service.select(angular.element('<div/>')[0]);
      const svg = container
        .append('svg')
        .attr('xmlns', D3Service.ns.prefix.svg)
        .attr('height', size)
        .attr('width', size)
        ;

      const rect = svg // eslint-disable-line
        .append('rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', size)
        .attr('height', size)
        .attr('fill', '#ddd')
        ;

      if (round) {
        rect.attr('rx', size);
      }

      initial = initial.length > 1 ? initial[0] : initial;

      const text = svg // eslint-disable-line
        .append('text')
        .text(initial)
        .attr('x', '50%')
        .attr('y', '50%')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('fill', '#555')
        .style('font-weight', 'bold')
        .style('font-size', scaledFontSize)
        ;

      return container[0];
    }
  }
})();

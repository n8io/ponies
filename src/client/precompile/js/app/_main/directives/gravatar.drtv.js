angular
  .module('app.directives')
  .directive('gravatar', gravatar)
  ;

/* @ngInject */
function gravatar(TemplateUrls, CryptoJs, UtilityService, d3) {
  return {
    restrict: 'E',
    scope: {
      email: '=',
      letter: '='
    },
    replace: true,
    templateUrl: TemplateUrls.GRAVATAR,
    link: linkFn
  };

  /* @ngInject */
  function linkFn($scope, element, attrs) {
    $scope.letter = $scope.letter || '';
    $scope.size = parseInt(attrs.size, 0) || 80;
    $scope.class = `gravatar-${$scope.size}`;
    $scope.defaultImage = attrs.default || 'identicon';
    $scope.forceDefault = angular.isDefined(attrs.force);
    $scope.rating = attrs.rating || 'G';
    $scope.round = angular.isDefined(attrs.round);
    $scope.emailHash = CryptoJs.MD5($scope.email).toString();

    element.bind('error', function() {
      const svg = angular.element(buildInitialLetterSvg($scope.letter, $scope.size, $scope.round, element));

      element.css('display', 'none'); // Hide broken image, replace with initial letter svg

      if ($scope.round) {
        svg.attr('class', $scope.class);
      }

      $(element).after(svg); // eslint-disable-line
    });

    if ($scope.round) {
      const styleEl = `
        <style id='${$scope.class}'>
          .${$scope.class} {
            vertical-align: text-top;
            height: ${$scope.size}px;
            width: ${$scope.size}px;
            border-radius: ${$scope.size}px;
            display: inline;
          }
        </style>
      `;

      element.addClass($scope.class);

      if (angular.element(`#${$scope.class}`).length === 0) {
        angular.element('body').append(styleEl);
      }
    }
  }

  function buildInitialLetterSvg(initial, size, round, element) {
    const initialScale = 20;
    const scaledFontSize = `${parseInt(size / initialScale, 0) * 100}%`;
    const container = d3.select(angular.element('<div/>')[0]);
    const svg = container
      .append('svg')
      .attr('xmlns', d3.ns.prefix.svg)
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

    container.attr('title', angular.element(element).attr('title'));

    if (round) {
      rect.attr('rx', size);
    }

    initial = initial.length > 1 ? initial[0] : initial;

    const text = svg // eslint-disable-line
      .append('text')
      .text(initial.toUpperCase())
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

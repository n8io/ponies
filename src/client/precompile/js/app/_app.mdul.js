(function() {
  'use strict';

  angular
    .module('app', [
      'ngResource',
      'ngMaterial', // https://material.angularjs.org/latest - Material UI with Angular hooks baked in
      'ngStorage', // https://github.com/gsklee/ngStorage - For leveraging sessionStorage and localStorage as a service
      'app.filters',
      'app.controllers',
      'app.directives',
      'app.services'
    ])
    ;
})();

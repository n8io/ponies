angular
  .module('app.services')
  .factory('toastr', toastrService)
  ;

/* @ngInject */
function toastrService() {
  toastr.options.positionClass = 'toast-bottom-left'; // eslint-disable-line

  return toastr;
}

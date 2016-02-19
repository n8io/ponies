angular
  .module('app.filters')
  .filter('mtpText', mtpText)
  ;

/* @ngInject */
function mtpText() {
  return function(mtp) {
    if (!mtp) {
      return '--';
    }

    if (mtp.RaceStatus.toLowerCase() === 'off') {
      return `R${mtp.RaceNum} OFF`;
    }
    else if (mtp.Status.toLowerCase() === 'closed') {
      return `FINISHED`;
    }
    else {
      return `R${mtp.RaceNum} MTP ${mtp.Mtp}`;
    }

    console.log('mtp', mtp); // eslint-disable-line
  };
}

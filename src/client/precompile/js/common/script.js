(function() {
  const oneMinute = 1000 * 60;

  $('.btn-bet').on('click', onBetToggleClick); // eslint-disable-line

  setInterval(updateTimestamps, oneMinute); // eslint-disable-line

  function updateTimestamps() {
    $('.ts').each(function(index, ts) { // eslint-disable-line
      const $ts = $(ts); // eslint-disable-line
      const time = parseInt($ts.attr('value'), 0);

      $ts.text(moment(time).fromNow()); // eslint-disable-line
    });
  }

  function onBetToggleClick() {
    $('body').toggleClass('bet-shown'); // eslint-disable-line
  }
})();


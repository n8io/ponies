(function() {
  const oneMinute = 1000 * 60;

  $('.btn-bet').on('click', onBetToggleClick);
  $('.bet-overlay').on('click', onBetToggleClick);

  setInterval(updateTimestamps, oneMinute);

  function updateTimestamps() {
    $('.ts').each(function(index, ts) {
      const $ts = $(ts);
      const time = parseInt($ts.attr('value'), 0);

      $ts.text(moment(time).fromNow());
    });
  }

  function onBetToggleClick() {
    const $ifm = $('iframe');

    if (!$ifm.attr('src')) {
      $('iframe').attr('src', 'https://m.twinspires.com');
    }

    $('body').toggleClass('bet-shown');
  }
})();

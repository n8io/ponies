(function() {
  const fifteenSeconds = 1000 * 15;

  setInterval(updateTimestamps, fifteenSeconds); // eslint-disable-line

  function updateTimestamps() {
    $('.ts').each(function(ts) { // eslint-disable-line
      const $ts = $(ts); // eslint-disable-line
      const time = parseInt($ts.attr('value'), 0);

      $ts.text(moment(time).fromNow()); // eslint-disable-line
    });
  }
})();


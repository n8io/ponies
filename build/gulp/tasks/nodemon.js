module.exports = function(gulp, plugins, cfg) {
  const livereload = plugins.livereload;

  gulp.task('nodemon', nodemon);

  function nodemon() {
    const monitor = plugins.nodemon(cfg.nodemon);

    // Required to handle bug when attempting to quit with Cmd + C
    monitor
      .on('restart', onAppRestarted)
      .on('quit', onAppQuit)
      ;
  }

  function onAppRestarted() {
    setTimeout(function() {
      livereload.changed('Server restarted and browser is about to be');
    }, 3000);
  }

  function onAppQuit() {
    process.exit();
  }
};

module.exports = function(gulp, plugins, cfg) {
  gulp.task('watch', watch);

  function watch() {
    plugins.livereload.listen();

    gulp.watch(cfg.js.client.src, ['eslint-client', 'compile-js']);
    gulp.watch(cfg.css.src, ['stylus', 'stylint']);
    gulp.watch(cfg.html.src, ['compile-html']);
    gulp.watch(cfg.js.twinspires.src, ['eslint-client', 'dropbox']);
    gulp.watch(cfg.js.server.src, ['eslint-server']);
  }
};

module.exports = function(gulp, plugins, cfg) {
  gulp.task('watch', watch);

  function watch() {
    plugins.livereload.listen();

    gulp.watch(cfg.js.client.src, ['eslint-client', 'compile-js']);

    gulp.watch(cfg.js.server.src, ['eslint-server']);

    gulp.watch(cfg.css.src, ['lint-css', 'compile-css']);
  }
};

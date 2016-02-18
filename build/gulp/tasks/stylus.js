module.exports = function(gulp, plugins, cfg) {
  gulp.task('stylus', stylus);

  function stylus() {
    const filter = plugins.filter(cfg.css.filter);
    const localEnv = 'local';

    return gulp
      .src(cfg.css.src)
      .pipe(filter) // Only concerned with building the wrapper
      .pipe(plugins.if(
          cfg.env === localEnv, // Using proper config based on env
          plugins.stylus(cfg.css.options.local),
          plugins.stylus(cfg.css.options.other)
      ))
      .pipe(plugins.header(cfg.css.banner.formatStr, cfg.start)) // Add timestamp to banner
      .pipe(plugins.rename(cfg.css.dest.file))
      .pipe(gulp.dest(cfg.css.dest.dir))
      .pipe(plugins.if(
          cfg.env === localEnv,
          plugins.livereload()
      ))
      ;
  }
};

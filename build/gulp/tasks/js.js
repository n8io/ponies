module.exports = function(gulp, plugins, cfg) {
  const localEnv = 'local';

  gulp.task('js', js);

  function js() {
    return gulp.src(cfg.js.client.src)
      .pipe(plugins.concat(cfg.js.client.filenameDebug)) // Concatenate all files
      .pipe(plugins.babel())
      .pipe(plugins.ngAnnotate(cfg.js.client.ngAnnotate))
      .pipe(plugins.jsbeautifier(cfg.js.client.jsbeautifier))
      .pipe(plugins.header(cfg.js.client.banner.formatStr, cfg.start)) // Add timestamp to banner
      .pipe(gulp.dest(cfg.js.client.dest))
      .pipe(plugins.stripDebug())
      .pipe(plugins.uglify(cfg.js.client.uglify))
      .pipe(plugins.header(cfg.js.client.banner.formatStr, cfg.start)) // Add timestamp to banner
      .pipe(plugins.concat(cfg.js.client.filename)) // Concatenate all files
      .pipe(gulp.dest(cfg.js.client.dest))
      .pipe(plugins.if(
        cfg.env === localEnv,
        plugins.livereload()
      ))
      ;
  }
};

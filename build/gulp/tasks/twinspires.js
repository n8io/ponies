module.exports = function(gulp, plugins, cfg) {
  const localEnv = 'local';

  gulp.task('twinspires', twinspires);

  function twinspires() {
    return gulp.src(cfg.js.twinspires.src)
      .pipe(plugins.debug())
      .pipe(plugins.concat(cfg.js.twinspires.filename)) // Concatenate all files
      .pipe(plugins.babel())
      .pipe(plugins.if(// Beautify or mangle
        cfg.env === localEnv,
        plugins.jsbeautifier(cfg.js.client.jsbeautifier),
        plugins.uglify(cfg.js.client.uglify)
      ))
      .pipe(plugins.if(// Strip console.* and debugger statements
        cfg.env !== localEnv,
        plugins.stripDebug()
      ))
      .pipe(plugins.header(cfg.js.client.banner.formatStr, cfg.start)) // Add timestamp to banner
      .pipe(gulp.dest(cfg.js.twinspires.dest))
      ;
  }
};

const cwd = require('cwd');

module.exports = function(gulp, plugins, cfg) {
  gulp.task('eslint-server', eslintServer);

  function eslintServer() {
    const customGulpFormatter = require(cwd('build/eslint/customGulpFormatter'));

    return gulp.src(cfg.js.server.src)
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format(customGulpFormatter))
      .pipe(plugins.eslint.failAfterError())
      ;
  }
};

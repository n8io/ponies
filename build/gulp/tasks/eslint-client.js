const path = require('path');
const projRoot = process.env.PWD;

module.exports = function(gulp, plugins, cfg) {
  gulp.task('eslint-client', eslintClient);

  function eslintClient() {
    const customGulpFormatter = require(path.join(projRoot, 'build/eslint/customGulpFormatter'));
    const src = cfg.js.client.src.map(function(s) {
      return `${s}`;
    });

    cfg.js.twinspires.src.forEach(function(s) {
      src.push(s);
    });

    return gulp.src(src)
      .pipe(plugins.eslint())
      .pipe(plugins.eslint.format(customGulpFormatter))
      .pipe(plugins.eslint.failAfterError())
      ;
  }
};

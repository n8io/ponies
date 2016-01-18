module.exports = function(gulp, plugins) {
  const cfg = require('./config');

  // Register all tasks
  require('./tasks')(gulp, plugins, cfg);

  // Expose custom multi-tasks
  gulp.task('compile', ['compile-js', 'compile-css', 'compile-statics']);
  gulp.task('compile-js', ['js']);
  gulp.task('compile-css', ['stylus']);
  gulp.task('compile-statics', ['statics']);
  gulp.task('lint-js', plugins.sequence('eslint-server', 'eslint-client'));
  gulp.task('lint-css', ['stylint']);
  gulp.task('lint', plugins.sequence('lint-js', 'lint-css'));

  gulp.task('default', function(cb) {
    return plugins.sequence(
      [
        'clean',
        'git-info',
        'compile'
      ]
    )(cb);
  });

  gulp.task('dev', plugins.sequence(
    [
      'lint',
      'default'
    ],
    'nodemon',
    'watch'
  ));
};

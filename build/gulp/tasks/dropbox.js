const shell = require('shelljs');

module.exports = function(gulp, plugins, cfg) { // eslint-disable-line no-unused-vars
  gulp.task('dropbox', ['twinspires'], dropbox);

  function dropbox() {
    shell.exec('npm run dropbox', {silent: true});

    return;
  }
};

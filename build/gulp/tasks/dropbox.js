const shell = require('shelljs');

module.exports = function(gulp, plugins, cfg) { // eslint-disable-line no-unused-vars
  gulp.task('dropbox', ['twinspires'], dropbox);

  function dropbox() {
    shell.exec('cp ./dist/js/twinspires.js ~/Dropbox/Public/hosted/ponies/twinspires.js', {silent: true});

    return;
  }
};

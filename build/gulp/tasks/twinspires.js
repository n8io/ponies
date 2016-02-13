module.exports = function(gulp, plugins, cfg) {
  gulp.task('twinspires', twinspires);

  function twinspires() {
    return gulp.src(cfg.js.twinspires.src)
      .pipe(plugins.concat(cfg.js.twinspires.filenameUnmind)) // Concatenate all files and rename
      .pipe(plugins.babel())
      .pipe(plugins.jsbeautifier(cfg.js.client.jsbeautifier))
      .pipe(plugins.header(cfg.js.client.banner.formatStr, cfg.start)) // Add timestamp to banner
      .pipe(plugins.replace(/{{pubsub_subscribe_key}}/ig, process.env.PUBNUB_SUBSCRIBE_KEY))
      .pipe(plugins.replace(/{{pubsub_publish_key}}/ig, process.env.PUBNUB_PUBLISH_KEY))
      .pipe(plugins.replace(/{{firebase_base_uri}}/ig, process.env.FIREBASE_BASE_URI))
      .pipe(gulp.dest(cfg.js.twinspires.dest))
      .pipe(plugins.stripDebug())
      .pipe(plugins.uglify(cfg.js.client.uglify))
      .pipe(plugins.concat(cfg.js.twinspires.filename)) // Rename to .min.js ext
      .pipe(gulp.dest(cfg.js.twinspires.dest))
      ;
  }
};

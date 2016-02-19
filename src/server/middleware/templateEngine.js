const cwd = require('cwd');

module.exports = function(app) {
  app.set('views', cwd('src/server/views'));
  app.set('view engine', 'jade');
};

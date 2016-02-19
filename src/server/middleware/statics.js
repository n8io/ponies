const cwd = require('cwd');
const serveStatic = require('serve-static');

module.exports = function(app) {
  app.use(serveStatic(cwd('dist')));
};

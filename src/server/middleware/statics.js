const path = require('path');
const projRoot = process.env.PWD;
const serveStatic = require('serve-static');

module.exports = function(app) {
  app.use(serveStatic(path.join(projRoot, 'dist')));
};

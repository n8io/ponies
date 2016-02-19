const fs = require('fs');
const cwd = require('cwd');
const _ = require('lodash');
const routesRelativeDir = 'src/server/routes';

module.exports = function(app, auth) {
  const prioritizedRoutes = [
    './heartbeat',
    './api',
    './bookmark'
  ];

  // Normalize to absolute paths
  const routes = _.map(prioritizedRoutes, function(mw) {
    return getRouteAbsolutePath(mw);
  });

  fs.readdirSync(__dirname).forEach(function(file) {
    if (file.toLowerCase() === 'index.js') {
      return; // We don't want to require index.js's
    }

    const filePath  = cwd(__dirname, file.split('.js').join(''));

    // If route isn't in the list already, lets add it to the list
    if (routes.indexOf(filePath) === -1) {
      routes.push(filePath);
    }
  });

  // Finally register the routes with the app
  _.each(routes, function(mw) {
    require(mw)(app, auth);
  });
};

function getRouteAbsolutePath(relativeToRoutesDirPath) {
  return cwd(routesRelativeDir, relativeToRoutesDirPath);
}

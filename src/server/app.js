const app = require('express')();
const server = require('http').Server(app);
const stormpath = require('express-stormpath');

require('dotenv-safe').load({silent: true});

const logger = require('./helpers/logger')();

const port = process.env.PORT;
const host = process.env.HOST;

require('./middleware')(app);
require('./routes')(app, stormpath);

app.on('stormpath.ready', startApp);

function startApp() {
  server.listen(port, host, function() {
    const actualHost = server.address().address;
    const actualPort = server.address().port;

    logger.info('%s@%s listening at http://%s:%s on Node', // eslint-disable-line
      process.env.npm_package_name,
      process.env.npm_package_version,
      actualHost,
      actualPort,
      process.version
    );

    logger.info(`STORMPATH_CLIENT_APIKEY_ID=${process.env.STORMPATH_CLIENT_APIKEY_ID}`);
    logger.info(`STORMPATH_CLIENT_APIKEY_SECRET=${process.env.STORMPATH_CLIENT_APIKEY_SECRET}`);
    logger.info(`STORMPATH_APPLICATION_HREF=${process.env.STORMPATH_APPLICATION_HREF}`);
  });

  module.exports = server;
}


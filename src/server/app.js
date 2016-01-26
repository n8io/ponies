const app = require('express')();
const server = require('http').Server(app);
const stormpath = require('express-stormpath');

require('dotenv-safe').load();

const logger = require('./helpers/logger')();

const port = process.env.PORT;
const host = process.env.HOST;

app.use(stormpath.init(app, {
  website: true,
  web: {
    register: {
      enabled: false
    }
  }
}));

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
  });

  module.exports = server;
}


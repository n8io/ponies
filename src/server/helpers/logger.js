const bunyan = require('bunyan');

module.exports = function() {
  const streams = [];

  if (process.env.BUNYAN_LOG_LEVEL !== 'OFF') {
    streams.push({
      stream: process.stdout,
      level: process.env.BUNYAN_LOG_LEVEL
    });
  }

  return bunyan.createLogger({
    name: process.env.npm_package_name,
    streams: streams,
    serializers: bunyan.stdSerializers
  });
};

const morgan = require('morgan');

module.exports = function(app) {
  if (process.env.EXPRESS_LOG_FORMAT !== 'OFF') {
    app.use(morgan(process.env.EXPRESS_LOG_FORMAT));
  }

  return;
};

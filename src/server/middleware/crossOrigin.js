const cors = require('express-cors');

module.exports = function(app) {
  app.use(cors({
    allowedOrigins: [
      '*.twinspires.com:*'
    ]
  }));
};

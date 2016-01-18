const cors = require('express-cors');

module.exports = function(app) {
  app.use(cors({
    allowedOrigins: [
      'https://www.twinspires.com'
    ]
  }));
};

const stormpath = require('express-stormpath');

module.exports = function(app) {
  app.use(stormpath.init(app, {
    website: true,
    web: {
      register: {
        enabled: false
      }
    }
  }));
};

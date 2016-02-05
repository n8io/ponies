const stormpath = require('express-stormpath');

module.exports = function(app) {
  app.use(stormpath.init(app, {
    website: true,
    web: {
      // login: {
      //   enabled: true
      // },
      // register: {
      //   enabled: false
      // }
      idSite: {
        enabled: true,
        uri: '/idSiteResult',    // default setting
        nextUri: '/'            // default setting
      }
    }
  }));
};

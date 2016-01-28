const stormpath = require('express-stormpath');

module.exports = function(app) {
  app.use(stormpath.init(app, {
    website: true,
    web: {
      register: {
        enabled: true,
        fields: {
          'twinspires_account': {
            enabled: true,
            label: 'TwinSpires Account',
            name: 'twinspires_account',
            placeholder: 'E.g. 200012345',
            required: true,
            type: 'text'
          }
        }
      }
    }
  }));
};

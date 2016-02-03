const express = require('express');
const _ = require('lodash');

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/ng', getConfig)
    ;

  app.use('/api/config', auth.groupsRequired(['admin', 'user'], false), router);

  function getConfig(req, res) {
    const cfg = {
      pubNub: {
        subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY
      },
      user: _.pick(req.user, [
        'email',
        'fullName',
        'givenName',
        'surname'
      ])
    };

    cfg.user = {
      email: cfg.user.email,
      firstName: cfg.user.givenName,
      lastName: cfg.user.surname,
      fullName: cfg.user.fullName
    };

    return res.json(cfg);
  }
}

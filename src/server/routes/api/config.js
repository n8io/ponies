const express = require('express');
const _ = require('lodash');

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/ng', getConfig)
    ;

  app.use('/api/config', auth.loginRequired, router);

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

    return res.json(cfg);
  }
}

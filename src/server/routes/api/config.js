const express = require('express');

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
      }
    };

    return res.json(cfg);
  }
}

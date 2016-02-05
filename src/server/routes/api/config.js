const express = require('express');
const cwd = require('cwd');
const _ = require('lodash');
const colorController = require(cwd('src/server/controllers/colors'));

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

    colorController
      .get()
      .then(function(colors) {
        cfg.colors = colors;

        return res.json(cfg);
      })
      ;
  }
}

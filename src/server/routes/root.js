'use strict';

const express = require('express');

module.exports = routeHandler;

function routeHandler(app /* app, auth */) {
  const router = express.Router();

  router
    .get('/', getRoot)
    ;

  app.use('/', router);
}

function getRoot(req, res) {
  return res.render('index', {});
}

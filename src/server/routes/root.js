'use strict';

const express = require('express');

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/', getRoot)
    ;

  app.use('/', auth.loginRequired, router);
}

function getRoot(req, res) {
  return res.render('index', {});
}

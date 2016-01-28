'use strict';

const express = require('express');

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/', getRoot)
    ;

  app.use('/', auth.groupsRequired(['users']), router);
}

function getRoot(req, res) {
  return res.render('index', {user: req.user});
}

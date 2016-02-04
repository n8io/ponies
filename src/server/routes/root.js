const express = require('express');

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/', getRoot)
    ;

  app.use('/', auth.groupsRequired(['user'], false), router);
}

function getRoot(req, res) {
  return res.render('v2/index', {user: req.user, showDebug: !!req.query.debug});
}

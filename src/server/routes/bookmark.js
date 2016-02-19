const express = require('express');

module.exports = routeHandler;

function routeHandler(app, auth) {
  const router = express.Router();

  router
    .get('/', getRoot)
    ;

  app.use('/bookmark', auth.groupsRequired(['admin', 'user'], false), router);
}

function getRoot(req, res) {
  return res.render('bookmark', {});
}

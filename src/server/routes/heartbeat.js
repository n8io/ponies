const express = require('express');
const cwd = require('cwd');
const heartbeatController = require(cwd('src/server/controllers/heartbeat'));

module.exports = routeHandler;

function routeHandler(app) {
  const router = express.Router();

  router
    .get('/', getHeartbeat)
    ;

  app.use('/heartbeat', router);
}

function getHeartbeat(req, res) {
  return res.json(heartbeatController.get());
}

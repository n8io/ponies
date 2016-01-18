const express = require('express');

module.exports = routeHandler;

function routeHandler(app /* , auth */) {
  const router = express.Router();

  router
    .get('/', getWager)
    .post('/', setWagerData)
    ;

  app.use('/api/wager', router);

  function getWager(req, res) {
    const wager = parseWager(req.query);

    app.io.emit('wager', wager);

    return res.json(wager);
  }

  function setWagerData(req, res) {
    const wager = parseWager(req.body);

    app.io.emit('wager', wager);

    return res.json(wager);
  }

  function parseWager(obj) {
    const fields = [
      'id',
      'acct',
      'email',
      'track',
      'race',
      'amount',
      'amountDisplay',
      'type',
      'selections',
      'horses'
    ];

    const wager = {};

    fields.forEach(function(f) {
      if (typeof obj[f] !== 'undefined') {
        wager[f] = obj[f];
      }
    });

    return wager;
  }
}

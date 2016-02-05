const fs = require('fs');
const cwd = require('cwd');
const controller = {
  get: get
};

module.exports = controller;

function get() {
  return new Promise(function(resolve) {
    const data = {};

    getThoroughbredColors()
      .then(function(tColors) {
        data.thoroughbred = tColors;

        return getHarnessColors();
      })
      .then(function(hColors) {
        data.harness = hColors;

        return resolve(data);
      })
      ;
  });
}

function getThoroughbredColors() {
  return new Promise(function(resolve) {
    fs.readFile(cwd('src/server/data/colors/thoroughbred.json'), 'utf8', function(err, data) {
      return resolve(JSON.parse(data));
    });
  });
}

function getHarnessColors() {
  return new Promise(function(resolve) {
    fs.readFile(cwd('src/server/data/colors/harness.json'), 'utf8', function(err, data) {
      return resolve(JSON.parse(data));
    });
  });
}

const fs = require('fs');
const request = require('request');
const semver = require('semver');
const cwd = require('cwd');
const packageJson = require(cwd('package.json'));
const destPath = cwd('.nvmrc');
const reqOpts = {
  uri: 'https://semver.io/node.json',
  json: true
};

request.get(reqOpts, function(err, res) {
  const semversions = res.body;
  const version = process.env.DOCKER_FORCE_NODE_VERSION || semver.maxSatisfying(semversions.stableVersions, packageJson.engines.node);

  writeRc(version);
});

function writeRc(nodeVersion) {
  fs.writeFileSync(destPath, nodeVersion);
}

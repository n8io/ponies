const fs = require('fs');
const yaml = require('json2yaml');
const request = require('request');
const semver = require('semver');
const cwd = require('cwd');
const packageJson = require(cwd('package.json'));
const destPath = cwd('circle.yml');
const reqOpts = {
  uri: 'https://semver.io/node.json',
  json: true
};

request.get(reqOpts, function(err, res) {
  const semversions = res.body;
  const version = semver.maxSatisfying(semversions.stableVersions, packageJson.engines.node);

  writeCircleCiYaml(version);
});

function writeCircleCiYaml(nodeVersion) {
  const yamlCfg = {
    machine: {
      node: {
        version: nodeVersion
      }
    },
    deployment: {
      develop: {
        branch: 'develop',
        heroku: {
          appname: `${process.env.npm_package_name}`
        }
      }
    }
  };

  fs.writeFileSync(destPath, yaml.stringify(yamlCfg));
}

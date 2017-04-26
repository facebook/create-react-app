require('../utils/loadEnv');

var paths = require('../config/paths');
var CLIEngine = require('eslint').CLIEngine;
var config = require('@trunkclub/eslint-config');

config.fix = true;
config.extensions = ['.js', '.jsx', '.es6'];

// CLIEngine env config differs from .eslintrc
// http://eslint.org/docs/developer-guide/nodejs-api#cliengine
config.envs = Object
  .keys(config.env)
  .filter(envKey => config.env[envKey])

var eslint = new CLIEngine(config);

var report = eslint.executeOnFiles([paths.appSrc]);
var formatter = eslint.getFormatter();

CLIEngine.outputFixes(report);
console.log(formatter(report.results));

if (report.errorCount !== 0) process.exit(1);

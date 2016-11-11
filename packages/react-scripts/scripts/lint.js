require('../utils/loadEnv');

var paths = require('../config/paths');
var CLIEngine = require('eslint').CLIEngine;
var config = require('@trunkclub/eslint-config');

var eslint = new CLIEngine(config);

var report = eslint.executeOnFiles([paths.appSrc]);
var formatter = eslint.getFormatter();

console.log(formatter(report.results));

if (report.errorCount !== 0) process.exit(1);

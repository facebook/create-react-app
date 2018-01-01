'use strict';
const stylelint = require('stylelint');
const stylelintFormatter = require('stylelint-formatter-pretty');
const formatter = require('eslint-friendly-formatter');
const CLIEngine = require('eslint').CLIEngine;

const paths = require('../config/paths');

stylelint
  .lint({
    cache: process.env.NODE_ENV !== 'production' && !process.env.CI,
    files: `${paths.appSrc}/**/*.css`,
    fix: true,
    formatter: stylelintFormatter,
  })
  .then(function(data) {
    console.log(data.output);
    console.log(stylelintFormatter(data.output));
  })
  .catch(function(err) {
    // handle errors
    console.error(err.stack);
  });

const cli = new CLIEngine({
  cache: process.env.NODE_ENV !== 'production' && !process.env.CI,
});
const report = cli.executeOnFiles([`${paths.appSrc}/`]);
const results = report.results || [];
const output = formatter(results);
console.log(output);

'use strict';
const stylelint = require('stylelint');
const stylelintFormatter = require('stylelint-formatter-pretty');

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

'use strict';
const stylelint = require('stylelint');
const stylelintFormatter = require('stylelint-formatter-pretty');

const paths = require('../config/paths');

stylelint
  .lint({
    files: `${paths.appSrc}/**/*.css`,
    formatter: stylelintFormatter,
    fix: true,
  })
  .then(function(data) {
    console.log(data.output);
    console.log(stylelintFormatter(data.output));
  })
  .catch(function(err) {
    // handle errors
    console.error(err.stack);
  });

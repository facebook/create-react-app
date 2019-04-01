'use strict';

const fs = require('fs');
const path = require('path');

const paths = require('../paths');

module.exports = fs.existsSync(
  path.resolve(paths.appPath, '.emotionconfig.json')
);

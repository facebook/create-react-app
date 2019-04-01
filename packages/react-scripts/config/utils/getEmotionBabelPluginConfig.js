'use strict';

const path = require('path');

const paths = require('../paths');

module.exports = require(path.resolve(paths.appPath, '.emotionconfig.json'));

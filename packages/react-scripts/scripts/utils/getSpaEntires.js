'use strict';

const glob = require('glob');
const path = require('path');

const paths = require('./../../config/paths');

function getSpaEntries() {
  const htmlTemplates = [
    ...glob.sync(path.join(paths.appSrc, '*.html')),
    ...glob.sync(path.join(paths.appPublic, '*.html')),
  ];

  return htmlTemplates.map(templatePath => ({
    name: path.basename(templatePath, '.html'),
    path: templatePath,
  }));
}

module.exports = getSpaEntries;

'use strict';

const glob = require('glob');
const path = require('path');

const paths = require('../../config/paths');

function getSpaEntries() {
  const htmlTemplates = [
    ...glob.sync(path.join(paths.appSrc, '*.html')),
    ...glob.sync(path.join(paths.appPublic, '*.html')),
  ];

  // return object with name of entries as keys and path as value
  return htmlTemplates.reduce((acc, templatePath) => {
    const entryName = path.basename(templatePath, '.html');

    acc[entryName] = { 
      htmlTemplatePath: templatePath,
      entryPath: path.join(paths.appSrc, `${entryName}.js`)
    };

    return acc;
  }, {});
}

module.exports = getSpaEntries;

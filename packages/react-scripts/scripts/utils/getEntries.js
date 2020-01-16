'use strict';

const glob = require('glob');
const path = require('path');

function getEntries(type, dirPath, globRegex) {
  const entryFiles = glob.sync(path.join(dirPath, globRegex));

  return entryFiles.reduce((entries, entryFile) => {
    // converts entryFile path to platform specific style
    // this fixes windows/unix path inconsitence
    // because node-glob always returns path with unix style path separators
    entryFile = path.join(entryFile);

    const localPath = entryFile.split(dirPath)[1];

    let entryName = path
      // get rid of extension from entry name
      .join(type, localPath.split(/(\.js|\.css|\.scss)$/)[0])
      // remove leading slash
      .replace(/^\/|\/$/g, '');

    entries[entryName] = path.join(dirPath, localPath);

    return entries;
  }, {});
}

module.exports = getEntries;

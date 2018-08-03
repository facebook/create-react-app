const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');

function filterFunc(src, dest) {
  return !src.endsWith('manifest.json');
}

/**
 * @param {string} source the full path to the root folder of the installer, such /dev/project/node_modules/@deskpro/apps-installer
 * @param {string} destination the full path to the root folder where the installer should be bundled
 * @return {Promise}
 */
module.exports = function(source, destination) {
  const actualSource = fs.realpathSync(source);
  const actualDestination = fs.realpathSync(destination);

  const sourcePath = path.resolve(actualSource, 'src', 'ADMIN_README.md');
  const destinationPath = path.resolve(
    actualDestination,
    'docs',
    'ADMIN_README.md'
  );

  return fsExtra.copy(sourcePath, destinationPath);
};

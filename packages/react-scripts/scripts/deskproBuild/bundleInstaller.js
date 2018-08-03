const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');

function filterFunc(src, dest) {
  // prevent the installer overwritting the manifest and app icon
  return !src.endsWith('manifest.json') && !src.endsWith('icon.png');
}

/**
 * @param {string} source the full path to the root folder of the installer, such /dev/project/node_modules/@deskpro/apps-installer
 * @param {string} destination the full path to where the installer should be bundled
 * @return {Promise}
 */
module.exports = function(source, destination) {
  const actualSource = fs.realpathSync(source);
  const distributionSource = path.resolve(actualSource, 'dist');
  const actualDestination = fs.realpathSync(destination);

  return fsExtra.copy(distributionSource, actualDestination, {
    filter: filterFunc,
    overwrite: true,
  });
};

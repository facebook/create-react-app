const fs = require('fs-extra');
const deskproManifest = require('../../config/deskproManifest');

/**
 * Returns the
 *
 * @param {String} sourcePackageJson
 * @param {String} destination
 * @return {string}
 */
module.exports = function(sourcePackageJson, destination) {
  const manifestJson = deskproManifest(sourcePackageJson);
  return fs.writeJson(destination, manifestJson);
};

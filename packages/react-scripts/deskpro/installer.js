const fs = require('fs-extra');
const paths = require('../config/paths');

const useCustom = fs.existsSync(paths.deskproInstaller);
const useBundled = !useCustom && fs.existsSync(paths.deskproInstallerPackage);

function filterWebackEntries(entries) {
  // no entry for installer
  if (!entries.install) {
    return entries;
  }

  if (!useCustom) {
    const newEntries = JSON.parse(JSON.stringify(entries));
    delete newEntries.install;
    return newEntries;
  }

  return entries;
}

function filterDistFiles(src, dest) {
  // prevent the installer overwritting the manifest and app icon
  return !src.endsWith('manifest.json') && !src.endsWith('icon.png');
}

function filterBuildFiles(src, dest) {
  return src.match(/\/install[^/]+$/);
}

/**
 * @param {string} source the full path to the root folder of the installer, such /dev/project/node_modules/@deskpro/apps-installer
 * @param {string} destination the full path to where the installer should be bundled
 * @return {Promise}
 */
function bundle(source, destination) {
  const actualSource = fs.realpathSync(source);

  const distributionSource = [
    path.resolve(actualSource, 'build'),
    path.resolve(actualSource, 'dist'),
  ].reduce(
    (path, nextPath) => (!path && fs.existsSync(nextPath) ? nextPath : path),
    null
  );

  if (!distributionSource) {
    console.warn('skip bundling the installer because it was not found. ');
    return Promise.resolve();
  }

  const copyFilter =
    distributionSource === path.resolve(actualSource, 'build')
      ? filterBuildFiles
      : filterDistFiles;
  const actualDestination = fs.realpathSync(destination);
  return fs.copy(distributionSource, actualDestination, {
    filter: copyFilter,
    overwrite: true,
  });
}

module.exports = {
  filterWebackEntries: filterWebackEntries,
  useBundled: useBundled,
  bundle: bundle,
};

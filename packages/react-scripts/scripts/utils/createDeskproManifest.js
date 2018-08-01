const fs = require('fs');
const chalk = require('chalk');

/**
 * Copies properties from source onto destination
 *
 * @param {Object} source
 * @param {Object} destination
 * @param {Object} mappings a map from properties of destination to properties of source
 */
function copyProperties(source, destination, mappings) {
  Object.keys(mappings).forEach(function(destinationProp) {
    const sourceProp = mappings[destinationProp];
    if (source.hasOwnProperty(sourceProp)) {
      destination[destinationProp] = source[sourceProp];
    }
  });
}

/**
 * @param {Object} destination
 * @param {Object} source
 * @param {Object} exclusions
 */
function cloneProperties(source, destination, exclusions) {
  Object.keys(source).forEach(function(sourceProp) {
    if (exclusions.indexOf(sourceProp) === -1) {
      destination[sourceProp] = source[sourceProp];
    }
  });
}

/**
 * Transform a setting definition into storage item definition
 *
 * @param {object}  setting
 * @return {{name: *, isBackendOnly: (*|boolean), permRead: (*|string), permWrite: (*|string)}}
 */
function settingToStorage(setting) {
  return {
    name: setting.name,
    isBackendOnly: setting.isBackendOnly || false,
    permRead: setting.permRead || 'EVERYBODY',
    permWrite: setting.permWrite || 'OWNER',
  };
}

/**
 * @param {Object} manifest
 */
function normalizeSettings(manifest) {
  if (!manifest.settings instanceof Array || manifest.settings.length === 0) {
    return;
  }
  const storage =
    manifest.storage && manifest.storage instanceof Array
      ? [].concat(manifest.storage)
      : [];
  const settings = [].concat(manifest.settings);

  // convert the settings items into storage items because settings use the storage mechanism
  const storageExtra = settings.map(settingToStorage).filter(function(name) {
    return !!name;
  });
  if (storage.length === 0) {
    manifest.storage = storageExtra;
    return;
  }

  // lets check if we have any clashes between the new storage entries and existing ones
  // in this case the permissions on the storage entry apply to the setting

  const storageExtraNames = storageExtra.map(function(perm) {
    return perm.name;
  });
  const storageNames = storage.map(function(perm) {
    return perm.name;
  });

  const safeToAdd = [];
  const mergeAdd = storageExtra.reduce(function(accumulator, perm) {
    if (-1 === storageNames.indexOf(perm.name)) {
      // new name
      safeToAdd.push(perm);
    } else {
      accumulator.push(perm);
    }
    return accumulator;
  }, []);

  const safeToKeep = [];
  const mergeExisting = storage.reduce(function(accumulator, perm) {
    if (-1 === storageExtraNames.indexOf(perm.name)) {
      // not a setting
      safeToKeep.push(perm);
    } else {
      accumulator[perm.name] = perm;
    }
    return accumulator;
  }, {});

  const merged = mergeAdd.map(function(add) {
    return Object.assign({}, add, mergeExisting[add.name]);
  });

  manifest.storage = []
    .concat(safeToKeep)
    .concat(safeToAdd)
    .concat(merged);
}

/**
 * Returns the
 *
 * @param {String} sourcePackageJson
 * @param {String} destination
 * @return {string}
 */
module.exports = function(sourcePackageJson, destination) {
  let packageJson;
  try {
    const content = fs.readFileSync(sourcePackageJson);
    packageJson = JSON.parse(content.toString('utf8'));
  } catch (e) {
    console.error(
      chalk.red(
        'Failed to read package.json from: ' +
          sourcePackageJson +
          '\n\n' +
          'Check the file exists and is valid json' +
          '\n' +
          'Error information:' +
          '\n'
      ),
      e
    );

    process.exit(1);
  }

  if (typeof packageJson.deskpro !== 'object') {
    console.error(
      chalk.red(
        chalk.bold('deskpro') +
          ' key not found in ' +
          sourcePackageJson +
          '\n\n'
      )
    );

    process.exit(1);
  }

  const manifestJson = {};
  copyProperties(packageJson, manifestJson, {
    appVersion: 'version',
    author: 'author',
    description: 'description',
    name: 'name',
  });
  cloneProperties(packageJson.deskpro, manifestJson, Object.keys(manifestJson));
  normalizeSettings(manifestJson);

  fs.writeFileSync(destination, JSON.stringify(manifestJson));
};

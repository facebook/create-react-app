const path = require('path');

function getVersions(packagePath, modulesPath) {
  try {
    const pkg = require(packagePath);
    const pkgNames = [].concat(
      Object.keys(pkg.dependencies || {}),
      Object.keys(pkg.devDependencies || {})
    )
    const versions = pkgNames
      .filter(name => name.startsWith('@trunkclub/'))
      .reduce((acc, name) => {
        const modulePath = path.join(modulesPath, name, 'package.json');
        try {
          return Object.assign({}, acc, {
            [name]: require(modulePath).version
          });
        } catch (e) {
          return acc;
        }
      }, {})
    return Object.assign({}, { [pkg.name]: pkg.version }, versions);
  } catch (e) {
    return { error: `${e.name}: ${e.message}` };
  }
}

function TrunkClubVersionsPlugin(options) {
  if (!options || !options.packagePath || !options.modulesPath) {
    throw new Error('Missing config for TrunkClubVersionsPlugin. Options `packagePath` and `modulesPath` are required.')
  }

  this.versionData = getVersions(options.packagePath, options.modulesPath);
}

TrunkClubVersionsPlugin.prototype.apply = function(compiler) {
  const file = JSON.stringify(this.versionData);

  compiler.plugin('emit', function(compilation, callback) {
    // Add a file to the webpack build
    compilation.assets['tcversions.json'] = {
      source() {
        return file;
      },
      size() {
        return file.length;
      }
    };

    callback();
  });
};

module.exports = TrunkClubVersionsPlugin;

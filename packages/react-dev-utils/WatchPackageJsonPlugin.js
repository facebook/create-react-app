'use strict';

// This Webpack plugin ensures that package.json is watched for changes and
// that appropriate actions are triggered, e.g. an eslint-loader recheck.

class WatchPackageJsonPlugin {
  constructor(packageJsonPath) {
    this.packageJsonPath = packageJsonPath;
    this.erroneousFiles = [];
  }

  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      const timestamp = compilation.fileTimestamps[this.packageJsonPath] || 0;

      if (timestamp > this.previousTimestamp && this.erroneousFiles.length) {
        this.erroneousFiles.forEach(filename => {
          compilation.fileTimestamps[filename] = timestamp;
        });
      }
    });

    compiler.plugin('emit', (compilation, callback) => {
      // Add package.json to the list of watched files. This needs to be done
      // for every compilation run since the list is rebuilt every time.
      compilation.fileDependencies.push(this.packageJsonPath);

      this.previousTimestamp = compilation.fileTimestamps[
        this.packageJsonPath
      ] || 0;

      // First we extract all files related to any occurred errors. Then
      // we remove any request params that could have been added by a plugin,
      // loader or the user.
      this.erroneousFiles = compilation.errors
        .reduce(
          (acc, error) => {
            acc.push.apply(acc, error.dependencies);

            return acc;
          },
          []
        )
        .map(entry => entry.request.replace(/\?.*$/));

      callback();
    });
  }
}

module.exports = WatchPackageJsonPlugin;

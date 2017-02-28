var fs = require("fs-extra");
var path = require("path");
var webpack = require("webpack");
var paths = require("../config/paths");
var config = require("../config/webpack.config.vendor");
var clearConsole = require("react-dev-utils/clearConsole");
var os = require("os");
var chalk = require("chalk");
var printErrors = require("../utils/printErrors");
var environment = process.env.NODE_ENV;
var vendorHash = require("../utils/vendorHash");

module.exports = (callback, args) => {
  if (shouldManifestUpdate()) {
    // fs.emptyDirSync(paths.vendorPath);
    return fs.readdir(paths.vendorPath, (err, files) => {
      try {
        files.filter(file => !file.indexOf(environment)).forEach(file => {
          fs.unlinkSync(path.join(paths.vendorPath, file));
        });
      } catch (e) {
      }
      var compiler = webpack(config);
      console.log("Bundling vendor files for faster rebuilds...");
      compiler.run((err, stats) => {
        if (err) {
          printErrors("Failed to compile.", [err]);
          process.exit(1);
        }

        if (stats.compilation.errors.length) {
          printErrors("Failed to compile.", stats.compilation.errors);
          process.exit(1);
        }

        if (process.env.CI && stats.compilation.warnings.length) {
          printErrors(
            "Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.",
            stats.compilation.warnings
          );
          process.exit(1);
        }

        console.log(chalk.green("Vendor compiled successfully."));
        console.log();
        callback();
      });
    });
  }
  console.log("Vendor file is up to date! No need to rebuild it");
  return callback();
};

function manifestExists() {
  return fs.existsSync(path.join(paths.vendorPath, vendorHash + ".json"));
}

function manifestStale() {
  if (vendorHash) {
    return false;
  }
  return true;
}

function shouldManifestUpdate() {
  var isExists = manifestExists();
  clearConsole();
  console.log("Using " + vendorHash + " vendor build");
  if (!isExists) {
    console.log("Vendor file needs to be created...");
    return true;
  }
  if (isExists && manifestStale()) {
    console.log("Vendor file needs to be updated...");
    return true;
  }
  return false;
}

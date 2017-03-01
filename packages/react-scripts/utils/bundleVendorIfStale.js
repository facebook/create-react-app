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

module.exports = (callback) => {
  if (shouldVendorBundleUpdate()) {
    return fs.readdir(paths.vendorPath, (err, files) => {
      try {
        // delete all stale vendor bundle for this environment
        files.filter(file => !file.indexOf(environment)).forEach(file => {
          fs.unlinkSync(path.join(paths.vendorPath, file));
        });
      } catch (e) {
      }
      var compiler = webpack(config);
      console.log("Compiling vendor bundle for faster rebuilds...");
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

        console.log(chalk.green("Vendor bundle compiled successfully."));
        console.log();
        callback();
      });
    });
  }
  return callback();
};

function manifestExists() {
  return fs.existsSync(path.join(paths.vendorPath, vendorHash + ".json"));
}

function shouldVendorBundleUpdate() {
  clearConsole();
  console.log("Checking if " + vendorHash + " vendor bundle exists");
  if (manifestExists()) {
    console.log("Vendor bundle is up to date and safe to use!");
    return false;
  }
  console.log("Vendor bundle needs to be compiled...");
  return true;
}

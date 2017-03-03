var paths = require('./paths');
var packageJson = require(paths.appPackageJson);
var chalk = require('chalk');

// To build a plugin, write a module that exports a single function.
// This function should takes a Webpack config and return the modified
// Webpack config. Here's an example that adds a SASS loader:
//
// module.exports = function(webpackConfig) {
//     webpackConfig.module.loaders.push({
//       test: /\.scss$/,
//       loaders: ["style", "css", "sass"]
//     });
//     return webpackConfig;
// };
function applyPlugins(webpackConfig) {
  var plugins = packageJson.plugins;

  if(!plugins) {
    return webpackConfig;
  }

  if(!Array.isArray(plugins)) {
    console.log(chalk.red('When specified, "plugins" in package.json must be an array.'));
    console.log(chalk.red('Instead, the type of "plugins" was "' + typeof plugins + '".'));
    console.log(chalk.red('Either remove "plugins" from package.json, or make it an array.'));
    process.exit(1);
  }

  // Load the plugin modules
  plugins = plugins.map(plugin => require(plugin));

  // Pass the webpack config through the set of plugins, allowing
  // each one to modify it as necessary
  var initialConfig = Object.assign({}, webpackConfig);
  var finalConfig = plugins.reduce(function(intermediateConfig, plugin) {
    return plugin(Object.assign({}, intermediateConfig));
  }, initialConfig);

  return finalConfig;
}

module.exports = {
  applyPlugins: applyPlugins
};

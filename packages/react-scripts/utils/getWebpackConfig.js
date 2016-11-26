var mergeWith = require('lodash/mergeWith');
var resolveApp = require('./resolveApp');
var paths = require('../config/paths');

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}

function getWebpackConfig(defaultPath) {
  var configPath = resolveApp(process.env.WEBPACK_REPLACE, defaultPath);

  var initialConfig = require(configPath);
  var extendConfig = resolveApp(process.env.WEBPACK_MERGE);

  var resultConfig = extendConfig ? mergeWith(
    initialConfig,
    require(extendConfig),
    customizer
  ) : initialConfig;

  var babelConfigPath = resolveApp(process.env.BABEL_REPLACE);

  if (babelConfigPath) {
    var loaderBabel = resultConfig.module.loaders.filter(function (loader) {
      return loader.loader === 'babel';
    })[0];

    if (!loaderBabel) {
      loaderBabel = {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: 'babel'
      };

      resultConfig.module.loaders.push(loaderBabel);
    }

    loaderBabel.query = require(babelConfigPath);
  }

  return resultConfig;
}

module.exports = getWebpackConfig;

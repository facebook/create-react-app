var customizers = require('./customizers');

function getCustomConfig(prod) {
  var prod = prod || false;
  var env = env || {};
  var result = Object
    .keys(customizers)
    .reduce(function (finalConfig, customizerKey) {
      var customizer = customizers[customizerKey];
      if (customizer.prod === false && prod === true) {
        return finalConfig;
      }

      var envValue = process.env['REACT_APP_' + customizerKey];
      if (env && envValue && envValue !== 'false') {
        if (customizer.toArray) {
          finalConfig[customizer.toArray].push(customizer.get());
        }
        finalConfig.values[customizerKey] = customizer.config || true;
      }
      return finalConfig;
    }, {
      presets: [],
      babelPlugins: [],
      plugins: [],
      loaders: [],
      values: {}
    });

  return result;
}

module.exports = getCustomConfig;
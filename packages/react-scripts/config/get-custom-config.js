var customizers = require('./customizers');

function getCustomConfig(env) {
  var env = env || {};
  var result = Object
    .keys(customizers)
    .reduce(function (finalConfig, customizerKey) {
      var customizer = customizers[customizerKey];
      if (env && env['process.env.REACT_APP_' + customizerKey]) {
        if (customizer.array) {
          finalConfig[customizer.array].push(customizer.module ? require.resolve(customizer.module) : customizer.loader);
        }
        else {
          finalConfig.others[customizerKey] = customizer.config;
        }
      }
      return finalConfig;
    }, {
      presets: [],
      plugins: [],
      loaders: [],
      others: {}
    });

  return result;
}

module.exports = getCustomConfig;
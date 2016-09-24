var customizers = require('./customizers');

function getCustomConfig(env, prod) {
  var prod = prod || false;
  var env = env || {};
  var result = Object
    .keys(customizers)
    .reduce(function (finalConfig, customizerKey) {
      var customizer = customizers[customizerKey];

      if(customizer.prod === false && prod === true){
        return finalConfig;
      };

      if (env && env['process.env.REACT_APP_' + customizerKey]) {
        switch (customizer.type) {
          case 'preset': {
            finalConfig.presets.push(require.resolve(customizer.module));
            break;
          }
          case 'babelPlugin': {
            finalConfig.babelPlugins.push(require.resolve(customizer.module));
            break;
          }
          case 'plugin': {
            finalConfig.plugins.push(customizer.getPlugin());
            break;
          }
          case 'loader': {
            finalConfig.loaders.push(customizer.loader);
            break;
          }
          case 'config': {
            finalConfig.others[customizerKey] = customizer.config;
            break;
          }
        }
      }
      return finalConfig;
    }, {
      presets: [],
      babelPlugins: [],
      plugins: [],
      loaders: [],
      others: {}
    });

  return result;
}

module.exports = getCustomConfig;
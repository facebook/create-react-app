const styleLoader = require('../webpack-config/style-loader');
const sassLoader = require.resolve('sass-loader');
const lessLoader = require.resolve('less-loader');
const stylusLoader = require.resolve('stylus-loader');

module.exports = {
  CSS: {
    default: true,
    get: styleLoader(undefined, /\.css$/, /\.module\.css$/),
  },
  SASS: {
    get: styleLoader(sassLoader, /\.s[ac]ss$/, /\.module\.s[ac]ss$/),
  },
  LESS: {
    get: styleLoader(lessLoader, /\.less$/, /\.module\.less$/),
  },
  STYLUS: {
    get: styleLoader(stylusLoader, /\.styl/, /\.module\.styl/),
  },
  STYLUS_MODULES: {
    get: styleLoader(stylusLoader, /\.module\.styl/, undefined, true),
  },
  LESS_MODULES: {
    get: styleLoader(lessLoader, /\.module\.less$/, undefined, true),
  },
  SASS_MODULES: {
    get: styleLoader(sassLoader, /\.module\.s[ac]ss$/, undefined, true),
  },
  CSS_MODULES: {
    get: styleLoader(undefined, /\.module\.css$/, undefined, true),
  },
};

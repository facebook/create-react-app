var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  'BABEL_STAGE_0': {
    toArray: 'presets',
    getDev: function () {
      return require.resolve('babel-preset-stage-0')
    }
  },
  'DECORATORS': {
    toArray: 'babelPlugins',
    getDev: function () {
      return require.resolve('babel-plugin-transform-decorators-legacy')
    }
  },
  'SASS': {
    toArray: 'loaders',
    fileRegex: /\.(scss|sass)/,
    getDev: function () {
      return {
        test: /(\.scss|\.sass)$/,
        loader: "style!css!postcss!sass"
      }
    },
    getProd: function () {
      return {
        test: /(\.scss|\.sass)$/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')
      }
    }
  },
  'LESS': {
    toArray: 'loaders',
    fileRegex: /\.less$/,
    getDev: function () {
      return {
        test: /\.less$/,
        loader: "style!css!postcss!less"
      }
    },
    getProd: function () {
      return {
        test: /\.less/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss!less')
      }
    }
  },
  'STYLUS': {
    toArray: 'loaders',
    fileRegex: /\.styl$/,
    getDev: function () {
      return {
        test: /\.styl/,
        loader: 'style!css!postcss!stylus'
      }
    },
    getProd: function () {
      return {
        test: /\.styl/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss!stylus')
      }
    }
  },
  'CSS_MODULES': {
    config: {
      dev: 'style!css?modules&camelCase&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss',
      prod: 'style!css?modules&camelCase&-autoprefixer&importLoaders=1!postcss'
    }
  }
}

module.exports = {
  'BABEL_STAGE_0': {
    toArray: 'presets',
    get: function () {
      return require.resolve('babel-preset-stage-0')
    }
  },
  'DECORATORS': {
    toArray: 'babelPlugins',
    get: function () {
      return require.resolve('babel-plugin-transform-decorators-legacy')
    }
  },
  'SASS': {
    toArray: 'loaders',
    get: function () {
      return {
        test: /\.scss$/,
        loader: "style!css!postcss!sass"
      }
    }
  },
  'LESS': {
    toArray: 'loaders',
    get: function () {
      return {
        test: /\.less$/,
        loader: "style!css!postcss!less"
      }
    }
  },
  'CSS_MODULES': {
    config: {
      dev: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss',
      prod: 'style!css?modules&-autoprefixer&importLoaders=1!postcss'
    }
  }
}
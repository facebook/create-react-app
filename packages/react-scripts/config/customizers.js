module.exports = {
  'BABEL_STAGE_0': {
    array: 'presets',
    module: 'babel-preset-stage-0'
  },
  'DECORATORS': {
    array: 'plugins',
    module: 'babel-plugin-transform-decorators-legacy'
  },
  'CSS_MODULES': {
    config: {
      dev: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss',
      prod: 'style!css?modules&-autoprefixer&importLoaders=1!postcss'
    }
  },
  'SASS': {
    array: 'loaders',
    loader: {
      test: /\.scss$/,
      loader: "style!css!postcss!sass"
    }
  },
  'LESS': {
    array: 'loaders',
    loader: {
      test: /\.less$/,
      loader: "style!css!postcss!less"
    }
  }
}
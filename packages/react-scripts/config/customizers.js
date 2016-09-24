module.exports = {
  'BABEL_STAGE_0': {
    type: 'preset',
    module: 'babel-preset-stage-0'
  },
  'DECORATORS': {
    type: 'babelPlugin',
    module: 'babel-plugin-transform-decorators-legacy'
  },
  'CSS_MODULES': {
    type: 'config',
    config: {
      dev: 'style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss',
      prod: 'style!css?modules&-autoprefixer&importLoaders=1!postcss'
    }
  },
  'SASS': {
    type: 'loader',
    loader: {
      test: /\.scss$/,
      loader: "style!css!postcss!sass"
    }
  },
  'LESS': {
    type: 'loader',
    loader: {
      test: /\.less$/,
      loader: "style!css!postcss!less"
    }
  },
  'WEBPACK_DASHBOARD': {
    type: 'plugin',
    prod: false,
    getPlugin: function getPlugin() {
      var DashboardPlugin = require('webpack-dashboard/plugin');
      var Dashboard = require('webpack-dashboard');
      return new DashboardPlugin(new Dashboard().setData)
    }
  }
}
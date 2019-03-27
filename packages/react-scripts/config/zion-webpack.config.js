require('dotenv').config()

const initiatedDirectory = process.env.INIT_CWD
const nodeExternals = require('webpack-node-externals')
const merge = require('webpack-merge')
const setupProxy = require('@fs/exo/proxy')
const baseWebpack = require('./webpack.config.js')

const craWebpack = baseWebpack('development')
delete craWebpack.entry
delete craWebpack.output
delete craWebpack.plugins
delete craWebpack.optimization

module.exports = merge(craWebpack, {
  externals: [nodeExternals(), 'react', 'react-dom', /^@fs/, /^@fs-sandbox/],
  entry: `${initiatedDirectory}/src/index.js`,
  output: {
    path: `${initiatedDirectory}/dist`,
    filename: chunkData => (chunkData.chunk.name === 'main' ? 'index.js' : '[name].js'),
    libraryTarget: 'commonjs2',
  },
  resolve: {
    alias: {
      // fix duplicate copies of react issue for hooks
      // https://github.com/webpack/webpack/issues/8607
      react: require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    },
  },
  // TODO: we can probably remove the whole module prop once babel-preset-frontier gets into react-scripts
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            customize: require.resolve('@fs/babel-preset-frontier/webpack-overrides'),
            presets: [require.resolve('@fs/babel-preset-frontier')],
          },
        },
      },
    ],
  },
  devServer: {
    before: app => setupProxy(app),
  },
})

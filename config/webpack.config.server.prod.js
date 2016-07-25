var path = require('path');
var fs = require('fs');
var webpack = require('webpack');

var isInNodeModules = 'node_modules' ===
  path.basename(path.resolve(path.join(__dirname, '..', '..')));
var relativePath = isInNodeModules ? '../../..' : '..';
var isInDebugMode = process.argv.some(arg =>
  arg.indexOf('--debug-template') > -1
);
if (isInDebugMode) {
  relativePath = '../template';
}

var srcPath = path.resolve(__dirname, relativePath, 'src');
var nodeModulesPath = path.join(__dirname, '..', 'node_modules');
var buildPath = path.join(__dirname, isInNodeModules ? '../../..' : '..', 'build/server');

const nodeModules = fs.readdirSync(nodeModulesPath)
  .filter(entry => ['.bin'].indexOf(entry) === -1)
  .reduce((reduction, entry, foo) => {
    const objectWithCommonJsModule = {};
    objectWithCommonJsModule[entry] = `commonjs ${entry}`;
    return Object.assign(reduction, objectWithCommonJsModule);
  }, {});

module.exports = {
  entry: path.join(srcPath, 'server/server'),
  target: 'node',
  devtool: 'source-map',
  output: {
    path: buildPath,
    filename: 'server.js',
    publicPath: '/'
  },
  externals: nodeModules,
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: srcPath,
        loader: 'babel',
        query: require('./babel.prod')
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        loader: 'file?emitFile=false',
      },
      {
        test: /\.(mp4|webm)$/,
        loader: 'url?limit=10000'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    })
  ]
};

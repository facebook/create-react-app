/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fs = require('fs');
var os = require('os');
var path = require('path');
var webpack = require('webpack');

var paths = require('../config/paths');

// Hacky command-line parsing. All flags are just ignored and there
// may be no args.
// TODO: support passing args to the script we're running
var nonflags = process.argv.filter(function(x) { return x[0] !== '-'; });
if (nonflags.length != 3) {
  console.error('Usage: react-scripts run foo.js');
  console.error(
    'foo.js is your script, resolved relative to the src directory.')
  process.exit(1);
}
var scriptName = nonflags[2];
var pathToEntry = path.join(paths.appSrc, scriptName);

// Figure out what all the node_modules are.
// We don't want to compile the node_modules, but we still want to
// do a commonjs require for them.
var nodeModules = {};
fs.readdirSync(paths.appNodeModules).filter(function(x) {
  return ['.bin'].indexOf(x) === -1;
}).forEach(function(mod) {
  nodeModules[mod] = 'commonjs ' + mod;
});

// Construct our script in a temporary file.
var outputPath = os.tmpDir();
var outputFile = 'entry.js';

// Configure webpack.
// TODO: support sourcemaps
// TODO: figure out if we want to automatically polyfill fetch
var config = {
  entry: [
    pathToEntry,
  ],
  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
    path: outputPath,
    filename: outputFile
  },
  externals: nodeModules,
  resolve: {
    extensions: ['', '.js', '.json'],
  },
  resolveLoader: {
    root: paths.ownNodeModules,
    moduleTemplates: ['*-loader']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: paths.appSrc,
        loader: 'babel',
        query: require('../config/babel.dev')
      },
      {
        test: /\.css$/,
        include: [paths.appSrc, paths.appNodeModules],
        loader: 'null'
      },
      {
        test: /\.json$/,
        include: [paths.appSrc, paths.appNodeModules],
        loader: 'json'
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        include: [paths.appSrc, paths.appNodeModules],
        loader: 'null',
      },
      {
        test: /\.(mp4|webm)$/,
        include: [paths.appSrc, paths.appNodeModules],
        loader: 'null'
      }
    ]
  },
};

// Compile the script
webpack(config).run(function(err, stats) {
  if (err) {
    console.error('error:', err.code, err.message);
    console.error(err);
    process.exit(2);
  }
  if (stats.hasErrors()) {
    var errors = stats.toJson().errors;
    console.error('stats has', errors.length, 'errors:');
    for (var i = 0; i < errors.length; i++) {
      console.error(errors[i]);
    }
    process.exit(3);
  }

  var scriptPath = path.resolve(outputPath, outputFile);
  require(scriptPath);
});

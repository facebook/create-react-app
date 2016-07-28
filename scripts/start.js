/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

process.env.NODE_ENV = 'development';

require('process-bootstrap')('react-app', 'REACT-APP')

var Path = require('path');
var debug = require('debug');
var Server = require('pundle-dev');
var debugInfo = debug('REACT-APP:Info');
var debugError = debug('REACT-APP:Error');

var port = process.env.PORT || 3000;

var server = new Server({
  pundle: {
    entry: [require.resolve('../config/polyfills'), 'index.js'],
    rootDirectory: Path.normalize(Path.join(__dirname, '../template/src')),
    pathType: 'filePath',
    moduleDirectories: ['node_modules'],
  },
  server: {
    port: port,
    error: debugError,
    ready() {
      debugInfo('Ready')
    },
    generated() {
      debugInfo('Regenerated')
    },
    hmr: true,
    sourceMap: true,
    sourceRoot: Path.normalize(Path.join(__dirname, '../template')),
  },
  watcher: {},
  generator: {
    sourceMap: true,
    wrapper: 'hmr',
  },
})

server.pundle.loadPlugins([
  [require.resolve('babel-pundle'), {
    config: require('../config/babel.dev'),
  }],
]).then(function() {
  return server.activate()
}).catch(debugError)

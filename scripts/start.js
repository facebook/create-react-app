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

const Path = require('path')
const debug = require('debug')
const Server = require('pundle-dev')
const debugInfo = debug('REACT-APP:Info')
const debugError = debug('REACT-APP:Error')

const port = process.env.PORT || 3000

const server = new Server({
  pundle: {
    entry: ['index.js'],
    rootDirectory: Path.normalize(Path.join(__dirname, '../template/src')),
    pathType: 'filePath',
    moduleDirectories: ['node_modules'],
  },
  server: {
    port,
    error(error) {
      debugError(error)
    },
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
}).catch((e) => console.log('error', e))

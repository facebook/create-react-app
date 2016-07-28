require('process-bootstrap')('react-app', 'REACT-APP')

const Path = require('path')
const debug = require('debug')
const Server = require('pundle-dev')
const debugInfo = debug('REACT-APP:Info')
const debugError = debug('REACT-APP:Error')

const port = 8056

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

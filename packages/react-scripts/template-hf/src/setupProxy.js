const setProxies = require('@fs/react-scripts/proxy/setupProxy')
const waitForWebpack = require('snow/lib/utils/waitForWebpack.js')
const setupServer = require('../server')

module.exports = app => {
  setProxies(app)
  waitForWebpack(app, false)
  setupServer(app, 'dist')
}

// This is a magic file. This is not required or imported from anywhere else.
// CRA runs this file when running npm start.
// This file is only run in development mode.

// sets local proxies using http-proxy-middleware configs
// docs here: https://github.com/fs-webdev/exo#proxy
const setProxies = require('@fs/react-scripts/proxy/setupProxy')
const waitForWebpack = require('snow/lib/utils/waitForWebpack.js')
const setupServer = require('../server')

module.exports = app => {
  // Sets up local proxies for XHR calls.
  //      e.g. /service/tf => https://beta.familysearch.org/service/tf
  //      beta above comes from your .env file
  setProxies(app)
  // Wait for Webpack to finish writing to the /dist folder
  // before starting up the app
  waitForWebpack(app, false)
  // Start up the Snow app
  setupServer(app, 'dist')
}

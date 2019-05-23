// This is a magic file. This is not required or imported from anywhere else.
// CRA runs this file when running npm start.
// This file is only run in development mode.

// sets local proxies using http-proxy-middleware configs
// docs here: https://github.com/fs-webdev/exo#proxy
const setProxies = require('@fs/react-scripts/proxy/setupProxy')

// Make setProxies() available in other files
module.exports = app => {
  // Sets up local proxies for XHR calls.
  //      e.g. /service/tf => https://beta.familysearch.org/service/tf
  //      beta above comes from your .env file
  setProxies(app)
}

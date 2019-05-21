// This file is meant to be run by Heroku. It can be run locally 
// by typing heroku local on the command line.

// sets local proxies using http-proxy-middleware configs
// docs here: https://github.com/fs-webdev/exo#proxy
const setProxies = require('@fs/react-scripts/proxy/setupProxy')
const app = require('./server')()

// If in development mode i.e. locally
if (app.get('env') === 'development') {
  app.stack.front(() => {
    // Sets up local proxies for XHR calls. 
    //      e.g. /service/tf => https://beta.familysearch.org/service/tf
    //      beta above comes from your .env file
    setProxies(app)
  })
}

module.exports = app

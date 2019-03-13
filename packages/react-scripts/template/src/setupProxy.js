// sets local proxies using http-proxy-middleware configs
// docs here: https://github.com/fs-webdev/exo#proxy
const setProxies = require('exo/proxy')

module.exports = app => {
  setProxies(app)
}

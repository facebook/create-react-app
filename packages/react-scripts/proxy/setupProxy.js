const proxy = require('http-proxy-middleware')
const fsconfig = require('fs-config/config/default')

/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config()
/* eslint-enable import/no-extraneous-dependencies */

// detect env
const env = process.env.REMOTE_ENV || 'beta'
// backwards compat for auth-middleware env implicit dependency
process.env.TARGET_ENV = env

// set keys directly from fs-config for the current env
function getFromEnv(thisEnv, key) {
  return fsconfig[thisEnv][key] || fsconfig.default[key]
}
const keys = ['FS_KEY', 'CIS_WEB']
keys.forEach(key => {
  process.env[key] = getFromEnv(env, key)
})

// dev key is only in default
process.env.FS_DEV_KEY = fsconfig.default.FS_DEV_KEY

// bring in auth middleware once required keys are set
const cookieParser = require('cookie-parser')
const base = require('connect-base')
const metric = require('connect-metric')
const auth = require('auth-middleware')
const resolver = require('./resolver')
const proxyList = require('./proxies')

const setProxies = (app, customProxies = []) => {
  // middleware required for auth middleware
  app.use(metric())
  app.use(base())
  app.use(resolver())
  app.use(cookieParser())

  // auth middleware
  auth('/auth', app)
  console.log('\n/auth local proxy set up!')

  // set default env target
  // prod auth keys don't exist in fs-config for security reasons, so only other alt-envs for now
  const target = getFromEnv(env, 'BASE_URL')

  const setProxy = proxyConfig => {
    app.use(
      proxy(proxyConfig.route, {
        target,
        changeOrigin: true,
        logLevel: 'debug',
        timeout: 5000,
        ...proxyConfig.options,
      })
    )
  }

  // set up all custom proxies first so they can override the defaults if needed
  customProxies.forEach(config => setProxy(config))
  // set up all default proxies
  proxyList.forEach(proxyConfig => setProxy(proxyConfig))
}

module.exports = setProxies

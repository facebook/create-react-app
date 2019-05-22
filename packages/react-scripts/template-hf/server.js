// Snow is FS version of Express
const snow = require('snow')
const layout = require('@fs/react-scripts/layout')

const urlLookup = {
  'cas-public-api.cas.ident.service': `${process.env.SG_BASE_URL}/service/ident/cas/cas-public-api`,
  'cis-public-api.cis.ident.service': `${process.env.SG_BASE_URL}/service/ident/cis/cis-public-api`,
}

// Docs: https://github.com/fs-webdev/frontier-binding-registry-client
const serviceLocatorOptions = {
  fallbackFunction(serviceName) {
    if (urlLookup[serviceName]) {
      return urlLookup[serviceName]
    }
    throw new Error(`${serviceName} was not found in binding registry or urlLookup`)
  },
}

// Snow config options. Docs: https://github.com/fs-webdev/snow 
const snowConfig = {
  experiments: [
    {
      name: 'coolEx',
      description: 'The coolest experiment. Author/Owner: {Your Name}',
      default: false,
    },
  ],
  proxyUser: true,
  cacheEncryption: true,
  serviceLocatorOptions,
}

module.exports = (app, dir = 'build') => {
  // Create Snow app
  snowConfig.app = app
  const snowApp = snow(__dirname, layout, snowConfig)

  snowApp.stack.postRoute(() => {
    // Create route for CRA SPA (Single Page App)
    snowApp.get('*', (req, res) => {
      res.render('index', {
        indexPath: `../${dir}/_index.html`,
      })
    })
  })

  return snowApp
}

const snow = require('snow')
const layout = require('@fs/react-scripts/layout')

const urlLookup = {
  'cas-public-api.cas.ident.service': `${process.env.SG_BASE_URL}/service/ident/cas/cas-public-api`,
  'cis-public-api.cis.ident.service': `${process.env.SG_BASE_URL}/service/ident/cis/cis-public-api`,
}

const serviceLocatorOptions = {
  fallbackFunction(serviceName) {
    if (urlLookup[serviceName]) {
      return urlLookup[serviceName]
    }
    throw new Error(`${serviceName} was not found in binding registry or urlLookup`)
  },
}

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
  snowConfig.app = app
  const snowApp = snow(__dirname, layout, snowConfig)

  snowApp.stack.postRoute(() => {
    snowApp.get('*', (req, res) => {
      res.render('index', {
        indexPath: `../${dir}/_index.html`,
      })
    })
  })

  return snowApp
}

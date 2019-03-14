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

module.exports = {
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

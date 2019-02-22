var urlLookup = {
  'cas-public-api.cas.ident.service': process.env.BASE_URL + '/cas-public-api',
  'cis-public-api.cis.ident.service': process.env.BASE_URL + '/cis-public-api',
};

var serviceLocatorOptions = {
  fallbackFunction: function (serviceName) {
    if (urlLookup[serviceName]) {
      return urlLookup[serviceName];
    }
    throw new Error(`${serviceName} was not found in binding registry or urlLookup`);
  }
};

module.exports = {
  experiments : [
    {
      // Author/Owner: Tyler Graf
      name: 'coolExperiment',
      description: 'The coolest experiment',
      default: true
    }
  ],
  proxyUser: true,
  cacheEncryption: true,
  serviceLocatorOptions
}

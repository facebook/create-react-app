'use strict';

const webpack = require('webpack');

const SAAS = 'SAAS';
const SELF_HOSTED = 'SELF_HOSTED';
const SAAS_FILE = 'saas';
const SELF_HOSTED_FILE = 'self-hosted';

module.exports = [
  new webpack.NormalModuleReplacementPlugin(/LOCATION_INTERCEPTORS/, function(
    resource
  ) {
    if (process.env.LOCATION === SAAS) {
      resource.request = resource.request.replace(
        /LOCATION_INTERCEPTORS/,
        `./interceptors/${SAAS_FILE}`
      );
    }
    if (process.env.LOCATION === SELF_HOSTED) {
      resource.request = resource.request.replace(
        /LOCATION_INTERCEPTORS/,
        `./interceptors/${SELF_HOSTED_FILE}`
      );
    }
  }),
];

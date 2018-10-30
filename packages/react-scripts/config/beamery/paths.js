'use strict';

const ENVS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
  STANDALONE: 'standalone',
};

const paths = {
  buildPath: 'dist',
  publicPath: false,
  appIndexJs: 'src/index.full',
};

switch (process.env.BMR_ENV) {
  case ENVS.PRODUCTION:
    paths.publicPath = 'https://storage.googleapis.com/beamery/';
    break;
  case ENVS.STAGING:
    paths.buildPath = '../../app-bath/dist';
    break;
  case ENVS.DEVELOPMENT:
    paths.buildPath = '../../app-bath/dev';
    break;
  case ENVS.STANDALONE:
  default:
    paths.appIndexJs = 'src/index';
    break;
}

module.exports = paths;

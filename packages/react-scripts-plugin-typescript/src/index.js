'use strict';

const {
  pushExtensions,
  pushExclusiveLoader,
} = require('react-dev-utils/plugins');

function apply(config, { paths }) {
  pushExtensions({ config }, [['.js', '.tsx', '.ts']]);
  pushExclusiveLoader({ config }, '/\\.(js|jsx)$/', {
    // Process TypeScript with `at-loader`
    test: /\.(ts|tsx)$/,
    include: paths.appSrc,
    loader: require.resolve('awesome-typescript-loader'),
    options: {
      silent: true,
      // @remove-on-eject-begin
      configFileName: require.resolve('tsconfig-react-app'),
      // @remove-on-eject-end
    },
  });
  return config;
}

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

function eject({ paths }) {
  const configFileName = require.resolve('tsconfig-react-app');
  const tsconfigContent = readFileSync(configFileName, 'utf8');

  const { appSrc } = paths;
  writeFileSync(join(appSrc, 'tsconfig.json'), tsconfigContent);
}

module.exports = { apply, eject };

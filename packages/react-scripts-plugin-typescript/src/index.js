'use strict';

const merge = require('lodash.merge');
const invariant = require('invariant');

// arr: [[afterExt, strExt1, strExt2, ...], ...]
function pushExtensions(config, arr) {
  const { resolve: { extensions } } = config;

  for (const [after, ...exts] of arr) {
    // Find the extension we want to add after
    const index = extensions.findIndex(s => s === after);
    invariant(
      index !== -1,
      `Unable to find extension ${after} in configuration.`
    );
    // Push the extensions into array in the order we specify
    extensions.splice(index + 1, 0, ...exts);
  }
}

function apply(config, { paths }) {
  // Deep copy configuration
  config = merge({}, config);

  pushExtensions(config, [['.js', '.tsx', '.ts']]);

  const { module: { rules: [, { oneOf: rules }] } } = config;

  // Find babel loader
  const jsTransformIndex = rules.findIndex(
    rule => rule.test.toString() === '/\\.(js|jsx)$/'
  );
  invariant(jsTransformIndex !== -1, 'Unable to find babel transform.');
  // Push typescript loader after babel-loader since they're related
  rules.splice(jsTransformIndex + 1, 0, {
    test: /\.(ts|tsx)$/,
    include: paths.appSrc,
    loader: require.resolve('awesome-typescript-loader'),
    options: {
      silent: true,
      configFileName: require.resolve('tsconfig-react-app'),
    },
  });

  return config;
}

module.exports = { apply };

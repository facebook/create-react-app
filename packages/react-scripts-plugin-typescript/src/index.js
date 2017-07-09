'use strict';

const merge = require('lodash.merge');
const invariant = require('invariant');

// arr: [[afterExt, regexExts, strExt1, strExt2, ...], ...]
function pushExtensions(config, arr) {
  const { resolve: { extensions }, module: { rules } } = config;

  for (const [after, , ...exts] of arr) {
    // Find the extension we want to add after
    const index = extensions.findIndex(s => s === after);
    invariant(
      index !== -1,
      `Unable to find extension ${after} in configuration.`
    );
    // Push the extensions into array in the order we specify
    extensions.splice(index + 1, 0, ...exts);
  }

  // Exclude the new extensions
  for (const { exclude } of rules) {
    if (exclude == null) {
      continue;
    }

    for (const [, regexExts] of arr) {
      exclude.push(regexExts);
    }
  }
}

function apply(config, { paths }) {
  // Deep copy configuration
  config = merge({}, config);

  pushExtensions(config, [['.js', /\.(ts|tsx)$/, '.tsx', '.ts']]);

  const { module: { rules } } = config;

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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const {
  default: getTargets,
  isBrowsersQueryValid,
  isRequired,
} = require('@babel/helper-compilation-targets');
const data = require('@babel/compat-data/plugins');

// Copying normalizeTargets (because it is not exported)
// https://github.com/babel/babel/blob/04354d155689405ba688d4b400702710f9cccc97/packages/babel-preset-env/src/normalize-options.js#L121-L129
const normalizeTargets = targets => {
  // TODO: Allow to use only query or strings as a targets from next breaking change.
  if (isBrowsersQueryValid(targets)) {
    return { browsers: targets };
  }
  return {
    ...targets,
  };
};

// Test which plugins our target browsers require
module.exports = function getRequiredPlugins(targets) {
  const requiredPlugins = {};
  const currentTargets = getTargets(normalizeTargets(targets));
  for (const name of Object.keys(data)) {
    requiredPlugins[name] = isRequired(name, currentTargets);
  }
  return requiredPlugins;
};

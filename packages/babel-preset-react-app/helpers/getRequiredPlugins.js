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
} = require('@babel/preset-env/lib/targets-parser');
const { isPluginRequired } = require('@babel/preset-env/lib/filter-items');
const data = require('@babel/preset-env/data/plugins.json');

// Copying normalizeTargets (because it is not exported)
// https://github.com/babel/babel/blob/7f732ad0198004a1d31543ddd848e6edc646e771/packages/babel-preset-env/src/normalize-options.js#L122-L130
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
  for (const [pluginName, pluginTargets] of Object.entries(data)) {
    requiredPlugins[pluginName] = isPluginRequired(
      currentTargets,
      pluginTargets
    );
  }
  return requiredPlugins;
};

/**
 * Copyright (c) 2018-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// While Create React App does not use polling for watching files by default,
// polling can occur if CHOKIDAR_USEPOLLING environment variable is
// set to a truthy value. Excessive polling can cause CPU overloads
// on some systems (see https://github.com/facebookincubator/create-react-app/issues/293),
// which is why we ignore node_modules if polling is enforced.
let shouldIgnoreNodeModules = false;

const envForceUsePolling = process.env.CHOKIDAR_USEPOLLING;

if (envForceUsePolling) {
  const usePollingLower = envForceUsePolling.toLowerCase();

  // Chokidar rules https://github.com/paulmillr/chokidar/blob/master/index.js#L99
  if (
    usePollingLower === 'true' ||
    usePollingLower === '1' ||
    !!usePollingLower
  ) {
    shouldIgnoreNodeModules = true;
  }
}

if (process.platform === 'darwin') {
  // On OSX polling can also occur if chokidar fails to load the
  // `fsevents` module. Check if the module is loaded:
  const cacheKeys = Object.keys(require.cache);
  const cachedFsEvents =
    require.cache[cacheKeys.find(i => i.includes('/fsevents/fsevents.js'))];

  if (cachedFsEvents && cachedFsEvents.loaded) {
    // fsEvents is loaded, check if its WebpackDevServers
    let parentIsWebpackDevServer = false;
    let parent = cachedFsEvents.parent;

    while (parent && !parentIsWebpackDevServer) {
      if (parent.id.includes('webpack-dev-server')) {
        parentIsWebpackDevServer = true;
      }

      parent = parent.parent;
    }

    if (!parentIsWebpackDevServer) {
      shouldIgnoreNodeModules = true;
    }
  } else {
    shouldIgnoreNodeModules = true;
  }
}

module.exports = shouldIgnoreNodeModules;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { URL } = require('url');

module.exports = getPublicUrlOrPath;

/**
 * Returns a URL or a path with slash at the end
 * In production can be URL, abolute path, relative path
 * In development can be a relative or absolute path
 * In development can use `path` module functions for operations
 *
 * @param {boolean} isEnvDevelopment
 * @param {(string|undefined)} homepage a valid url or pathname
 * @param {(string|undefined)} envPublicUrl a valid url or pathname
 * @returns {string}
 */
function getPublicUrlOrPath(isEnvDevelopment, homepage, envPublicUrl) {
  const stubDomain = 'https://create-react-app.dev';

  if (envPublicUrl) {
    // ensure last slash exists
    envPublicUrl = envPublicUrl.endsWith('/')
      ? envPublicUrl
      : envPublicUrl + '/';

    // Some apps do not use client-side routing with pushState.
    // For these, "$PUBLIC_URL" can be set to "." to enable relative asset paths.
    if (envPublicUrl.startsWith('.')) {
      return envPublicUrl;
    }

    // validate if `envPublicUrl` is a URL or path like
    // `stubDomain` is ignored if `envPublicUrl` contains a domain
    const validPublicUrl = new URL(envPublicUrl, stubDomain);
    return isEnvDevelopment ? validPublicUrl.pathname : envPublicUrl;
  }

  if (homepage) {
    // ensure last slash exists
    homepage = homepage.endsWith('/') ? homepage : homepage + '/';

    // Some apps do not use client-side routing with pushState.
    // For these, homepage can be set to "." to enable relative asset paths.
    if (homepage.startsWith('.')) {
      return homepage;
    }

    // validate if `homepage` is a URL or path like and use just pathname
    const validHomepagePathname = new URL(homepage, stubDomain).pathname;
    return isEnvDevelopment ? validHomepagePathname : homepage;
  }

  return '/';
}

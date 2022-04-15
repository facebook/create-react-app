'use strict';

const fs = require('fs');
const paths = require('../../config/paths');

/**
 * In order to build for SSR, need to confirm 3 places
 * 
 * 1. `ssrEnabled` is on
 * 2. Use `build-ssr` command
 * 3. `ssr.js` exists in `src` folder
 * 
 */
const isSsr = () => {
  // Ensure `ssrEnabled` is on
  const appPackageJson = require(paths.appPackageJson);
  const bpkReactScriptsConfig = appPackageJson['backpack-react-scripts'] || {};
  const ssrEnabled = bpkReactScriptsConfig.ssrEnabled || false;

  // Ensure using `build-ssr` command
  const args = process.argv.slice(2);
  const scriptIndex = args.findIndex(x => x === 'build-ssr');
  const isToBuildSsr = scriptIndex === -1;

  // Ensure `ssr.js` exists in `src` folder
  const isSsrJsExisted = fs.existsSync(paths.appSsrJs);

  return ssrEnabled && isToBuildSsr && isSsrJsExisted;
};

module.exports = isSsr;

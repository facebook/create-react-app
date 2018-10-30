'use strict';

const paths = require('./paths');

// Use the `package.json` app name to simplify setup.
const appName = paths.appPackageJson.name;
process.env.BMR_APP_NAME = appName;

module.exports = {
  // Webpack allows us to define a path in sources. This can be useful for
  // debugging against other applications.
  devtoolRoot: appName ? appName + ':///' : '',
  // This prefix is not used for `standalone` builds.
  filenamePrefix: appName ? appName + '.' : '',
};

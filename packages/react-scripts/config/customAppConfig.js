const { existsSync, readFileSync } = require('fs');
const paths = require('./paths');
const pkgJson = require(paths.appPackageJson);
const customAppConfig = pkgJson['babylon-react-app-config'] || {};

const getSassOptions = () => {
  if (customAppConfig['sass-overrides'] && existsSync(paths.scssOverridesSrc)) {
    return {
      data: readFileSync(paths.scssOverridesSrc),
    };
  }
  return {};
};

module.exports = {
  getSassOptions,
};

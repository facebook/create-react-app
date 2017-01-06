var fse = require('fs-extra');
var fs = require('fs');
var paths = require('../config/paths');

module.exports = () => {
  var appPackageJson = fse.readJsonSync(paths.appPackageJson);
  return appPackageJson.hasOwnProperty('babel') || fs.existsSync(paths.babelrc);
};

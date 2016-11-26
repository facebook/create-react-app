var fs = require('fs');
var path = require('path');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
var appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath, defaultPath) {
  return relativePath ?
    path.resolve(appDirectory, relativePath) :
    defaultPath;
}

module.exports = resolveApp;

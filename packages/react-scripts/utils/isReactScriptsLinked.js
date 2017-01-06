var path = require('path');
var fs = require('fs');

module.exports = () => {
  var localReactScriptsPath = path.resolve('node_modules/react-scripts');
  return fs.existsSync(localReactScriptsPath) && fs.lstatSync(localReactScriptsPath).isSymbolicLink();
};

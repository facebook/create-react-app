module.exports = function(hostPath, appName) {
  var selfPath = hostPath + '/node_modules/create-react-app-scripts';

  var hostPackage = require(hostPath + '/package.json');
  var selfPackage = require(selfPath + '/package.json');

  // Copy over devDependencies
  for (var key in selfPackage.devDependencies) {
    hostPackage.dependencies[key] = selfPackage.devDependencies[key];
  }

  // Setup the script rules
  hostPackage.scripts = {};
  ['start', 'build', 'publish-gh-pages'].forEach(function(command) {
    hostPackage.scripts[command] = 'node node_modules/create-react-app-scripts/' + command + '.js';
  });

  fs.writeFileSync(hostPath + '/package.json', JSON.stringify(hostPackage, null, 2));

  // Move the src folder
  fs.renameSync(selfPackage + '/src', hostPackage + '/src');

  console.log('Creating the app', appName, 'at', hostPath);
};

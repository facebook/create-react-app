var chalk = require('chalk');
var execSync = require('child_process').execSync;

var execOptions = { encoding: 'utf8' };

function isProcessAReactApp(processCommand) {
  return /^node .*react-scripts\/scripts\/start\.js\s?$/.test(processCommand);
}

function getProcessIdsOnPort(port) {
  return execSync('lsof -i:' + port + ' -P -t', execOptions).match(/(\S+)/g);
}

function getProcessCommandById(processId) {
  var command = execSync('ps -o command -p ' + processId + ' | sed -n 2p', execOptions);
  return (isProcessAReactApp(command)) ? 'create-react-app\n' : command;
}

function getDirectoryOfProcessById(processId) {
  return execSync('lsof -p '+ processId + ' | grep cwd | awk \'{print $9}\'', execOptions);
}

function getProcessForPort(port) {
  try {
    var processIds = getProcessIdsOnPort(port);

    var processCommandsAndDirectories = processIds.map(function(processId) {
      var command = getProcessCommandById(processId);
      var directory = getDirectoryOfProcessById(processId);
      return chalk.cyan(command) + chalk.blue('  in ') + chalk.cyan(directory);
    });

    return processCommandsAndDirectories.join('\n  ');
  } catch(e) {
    return null;
  }
}

module.exports = getProcessForPort;


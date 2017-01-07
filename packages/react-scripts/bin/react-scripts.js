#!/usr/bin/env node
var spawn = require('cross-spawn');
var getDebugFlag = require('../utils/getDebugFlag');
var script = process.argv[2];
var args = process.argv.slice(3);

switch (script) {
case 'build':
case 'eject':
case 'start':
case 'test':
  var scriptArgs = [require.resolve('../scripts/' + script)].concat(args);
  var debugFlag = getDebugFlag(args);
  if (debugFlag) {
    scriptArgs.unshift(debugFlag);
  }
  var result = spawn.sync(
    'node',
    scriptArgs,
    {stdio: 'inherit'}
  );
  process.exit(result.status);
  break;
default:
  console.log('Unknown script "' + script + '".');
  console.log('Perhaps you need to update react-scripts?');
  break;
}

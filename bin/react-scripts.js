#!/usr/bin/env node
var path = require('path');
var spawn = require('cross-spawn');
var script = process.argv[2];
var args = process.argv.slice(3);

switch (script) {
case 'build':
case 'start':
case 'eject':

/* We create a new node process, that will fire of our commands as well as
adding incoming arugments from the action.
*/

  spawn(
    'node',
    [path.resolve(__dirname, '..', 'scripts', script)].concat(args),
    {stdio: 'inherit'}
  );
  break;
default:
  console.log('Unknown script "' + script + '".');
  console.log('Perhaps you need to update react-scripts?');
  break;
}

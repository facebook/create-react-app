#!/usr/bin/env node
var spawn = require('cross-spawn');
var script = process.argv[2];
var args = process.argv.slice(3);

switch (script) {
case 'build':
case 'start':
case 'eject':
  var results = spawn(
    'node',
    [require.resolve('../scripts/' + script)].concat(args),
    {stdio: 'inherit'}
  );
  process.exit(results.status);
  break;
default:
  console.log('Unknown script "' + script + '".');
  console.log('Perhaps you need to update react-scripts?');
  break;
}

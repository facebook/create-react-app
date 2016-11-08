#!/usr/bin/env node
var spawn = require('cross-spawn');
var checkNodeVersion = require('../utils/checkNodeVersion');
var script = process.argv[2];
var args = process.argv.slice(3);

checkNodeVersion(process.cwd());

function run (s) {
  switch (s) {
  case 'build':
  case 'eject':
  case 'start':
  case 'test':
  case 'build-module':
    var result = spawn.sync(
      'node',
      [require.resolve('../scripts/' + s)].concat(args),
      {stdio: 'inherit'}
    );
    process.exit(result.status);
    break;
  case 'develop': case 'd':
    console.log('The "' + s + '" task has been renamed to "start".');
    console.log();
    run('start');
    break;
  case 'lint': case 'l':
  case 'publish': case 'p':
  case 'package-status': case 'ps':
  case 'flow': case 'f':
    console.log('The "' + s +'" task is no longer separate from the "build", "start", and "test" tasks.')
    break;
  default:
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update @trunkclub/build?');
    break;
  }
}

run(script)

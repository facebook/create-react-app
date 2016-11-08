// Adpated from https://github.com/trunkclub/tcweb-build/blob/master/src/cli/tasks/publish.es6

var path = require('path');
var spawn = require('cross-spawn');

var pkg = require(path.join(process.cwd(), 'package.json'));
var current = pkg.version;
var latest = spawn.sync(
  'npm',
  ['view', pkg.name, 'dist-tags.latest']
).stdout.toString().replace(/\n/, '');

console.log();
console.log('   package = ' + current);
console.log('  registry = ' + latest);
console.log();


if (current === latest) {
  console.log('Already published on trunkclub private registry.');
} else {
  console.log('Version not published to trunkclub private registry...');
  spawn.sync(
    'npm',
    ['publish', '--access restricted'],
    {stdio: 'inherit'}
  );
  console.log('New version published to trunkclub private registry.');
}

console.log();

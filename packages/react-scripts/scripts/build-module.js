require('../utils/loadEnv');

var paths = require('../config/paths');
var spawn = require('cross-spawn');
var result;

var defaults = [
  '--presets=trunkclub',
  '--source-maps'
];

var directoryArgs = [
  paths.appSrc,
  '--out-dir=' + paths.appBuild
];


var args = process.argv.slice(2).concat(defaults);

var isWatchMode = args.indexOf('--watch') !== -1 || args.indexOf('-w') !== -1

// Don't send watch to babel cli
args = args.filter(function (arg) { return arg !== '--watch' && arg !== '-w'})

result = spawn.sync('node', [require.resolve('./lint')], {stdio: 'inherit'});

if (result.status && !isWatchMode) process.exit(result.status);

result = spawn.sync(
  'node',
  [require.resolve('babel-cli/bin/babel.js')].concat(directoryArgs).concat(args),
  {stdio: 'inherit'}
);

if (!isWatchMode) process.exit(result.status);


// Watch for incremental changes
var chokidar = require('chokidar');

chokidar.watch(paths.appSrc + '**/*.js', {
  persistent: true,
  ignoreInitial: true
}).add(paths.appSrc + '**/*.jsx')
  .add(paths.appSrc + '**/*.es6')
  .on('all', function (event, path) {
    switch (event) {
      case 'add':
      case 'change':
        spawn.sync('node', [require.resolve('./lint')], {stdio: 'inherit'});
        spawn.sync(
          'node',
          [require.resolve('babel-cli/bin/babel.js')].concat([
            path, '--out-dir=' + paths.appBuild ]).concat(args),
          {stdio: 'inherit'}
        );
    }
  })

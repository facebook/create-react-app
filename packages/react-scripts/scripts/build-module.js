require('../utils/loadEnv');

var path = require('path');
var fs = require('fs-extra');
var chokidar = require('chokidar');
var transformFileSync = require('babel-core').transformFileSync;
var spawn = require('cross-spawn');
var paths = require('../config/paths');

function lint () {
  return spawn.sync('node', [require.resolve('./lint')], {stdio: 'inherit'});
}

function transformWithBabel (filePath) {
  const { code } = transformFileSync(path.join(paths.appSrc, filePath), {
    ast: false,
    sourceMaps: 'inline',
    presets: [
      require.resolve('babel-preset-trunkclub')
    ],
    plugins: [
      [require.resolve('babel-plugin-module-resolver'), {
        root: [paths.appSrc]
      }]
    ]
  });
  fs.writeFileSync(path.join(paths.appBuild, filePath), code);
}

function copyAsset (filePath) {
  fs.copySync(path.join(paths.appSrc, filePath),
              path.join(paths.appBuild, filePath))
}

function processFile (filePath) {
  if (/\.(es6|jsx?)$/.test(filePath)) {

    fs.mkdirpSync(path.parse(path.join(paths.appBuild, filePath)).dir);
    transformWithBabel(filePath);
    console.log(path.join(paths.appSrc, filePath) + ' -> ' + path.join(paths.appBuild, filePath));

  } else if (/\.(s?css|svg|json|ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$/.test(filePath)) {

    fs.mkdirpSync(path.parse(path.join(paths.appBuild, filePath)).dir);
    copyAsset(filePath)
    console.log(path.join(paths.appSrc, filePath) + ' -> ' + path.join(paths.appBuild, filePath));

  }
}


var args = process.argv.slice(2);

var outDirIdx = args.indexOf('-d') !== -1
  ? args.indexOf('-d')
  : args.indexOf('--out-dir')
if (outDirIdx !== -1) {
  paths.appBuild = path.resolve(paths.appBuild, '..', args[outDirIdx + 1])
}

var result = lint();
fs.walkSync(paths.appSrc).forEach(function (filePath) {
  processFile(path.relative(paths.appSrc, filePath));
});

var isWatch = args.indexOf('-w') !== -1 || args.indexOf('--watch') !== -1
if (!isWatch) process.exit(result.status);

var watcher = chokidar.watch([
  '**/*.*'
], {
  cwd: paths.appSrc,
  persistent: true,
  ignoreInitial: true
})

watcher.on('all', function (event, filePath) {
  if (event === 'add' || event === 'change') {
    lint();
    processFile(filePath);
  }
})

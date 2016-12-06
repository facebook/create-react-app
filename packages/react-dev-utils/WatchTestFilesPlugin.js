var glob = require('glob');
var path = require('path');

function computeGlob(pattern, options) {
  return new Promise((resolve, reject) => {
    glob(pattern, options || {}, (err, matches) => {
      if (err) {
        return reject(err);
      }
      resolve(matches);
    });
  });
}

function WatchTestFilesPlugin(testGlobs) {
  this.testGlobs = testGlobs || [];
}

WatchTestFilesPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    console.log()
    Promise.all(this.testGlobs.map(globPattern =>
      computeGlob(globPattern, {
        cwd: compiler.options.context,
        ignore: 'node_modules/**',
      })
    ))
    .then(globLists => [].concat.apply([], globLists))
    .then(testFiles => {
      testFiles.forEach(testFile => {
        compilation.fileDependencies.push(path.join(compiler.options.context, testFile));
      });
    })
    .then(callback)
    .catch(console.error);
  });
};

module.exports = WatchTestFilesPlugin;

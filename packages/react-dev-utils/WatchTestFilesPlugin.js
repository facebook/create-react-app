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

function getGlobs(patterns, cwd) {
  return Promise.all(patterns.map(globPattern =>
    computeGlob(globPattern, {
      cwd: cwd,
      ignore: 'node_modules/**',
    })
  ))
  .then(globLists => [].concat.apply([], globLists))
}

function WatchTestFilesPlugin(testGlobs) {
  this.testGlobs = testGlobs || [];
}

WatchTestFilesPlugin.prototype.apply = function(compiler) {
  var testFiles = [];
  compiler.plugin('make', (compilation, callback) => {
    getGlobs(this.testGlobs, compiler.options.context)
    .then(foundFiles => {
      testFiles = foundFiles;
      return Promise.all(
        testFiles.map(filename => new Promise((resolve, reject) => {
          // TODO: add to modules
          resolve(filename);
        }))
      )
    })
    .then(callback);
  });
  compiler.plugin('emit', (compilation, callback) => {
    testFiles.forEach(testFile => {
      compilation.fileDependencies.push(path.join(compiler.options.context, testFile));
    });
    callback();
  });
};

module.exports = WatchTestFilesPlugin;

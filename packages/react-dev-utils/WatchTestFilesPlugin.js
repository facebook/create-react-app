var glob = require('glob');
var path = require('path');
var os = require('os');
var SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

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
      ignore: 'node_modules/**/*',
      nodir: true,
    })
  ))
  .then(globLists => [].concat.apply([], globLists))
}

function WatchTestFilesPlugin(testGlobs) {
  this.testGlobs = testGlobs || [];
}

function compileTestFile(compiler, compilation, context, testFile) {
  var outputOptions = {
    filename: path.join(os.tmpdir(), '__compiledTests__', testFile),
    publicPath: compilation.outputOptions.publicPath,
  };
  var compilerName = "WatchTestFiles compilation for " + testFile;
  var childCompiler = compilation.createChildCompiler(compilerName, outputOptions);
  childCompiler.context = context;
  childCompiler.apply(
    new SingleEntryPlugin(context, path.join(compiler.options.context, testFile))
  );
  return new Promise((resolve, reject) => {
    childCompiler.runAsChild((err, entries, childCompilation) => {
      if (err) {
        return reject(err);
      }
      resolve({
        errors: childCompilation.errors,
        warnings: childCompilation.warnings,
      });
    });
  });
}

WatchTestFilesPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compilation, callback) => {
    getGlobs(this.testGlobs, compiler.options.context)
    .then(foundFiles => Promise.all(
      foundFiles.map(filename => {
        // Add them to the list of watched files (for auto-reloading)
        compilation.fileDependencies.push(path.join(compiler.options.context, filename));
        // Create and run a sub-compiler for the file to send it through the loaders
        return compileTestFile(compiler, compilation, compiler.context, filename)
      })
    ))
    .then((results) => {
      var errors = results.reduce((list, res) => list.concat(res.errors || []), []);
      var warnings = results.reduce((list, res) => list.concat(res.warnings || []), []);
      compilation.errors = compilation.errors.concat(errors);
      compilation.warnings = compilation.warnings.concat(warnings);
      callback();
    }, callback);
  });
};

module.exports = WatchTestFilesPlugin;

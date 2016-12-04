var fs = require('fs');
var path = require('path');

function FlowTypecheckPlugin(options) {
  this.options = options || {};
  // If flow is globally present in the project, this will stay across compilations
  this._flowInitialized = false;
  // If flow should run in a current compilation
  this._flowShouldRun = false;
  // Stores the last flow output
  this._flowOutput = "";
}

FlowTypecheckPlugin.prototype.apply = function(compiler) {
  compiler.plugin('compilation', function(compilation, params) {
    // Detect the presence of flow and initialize it
    compilation.plugin('normal-module-loader', function(loaderContext, module) {
      // We're only checking the presence of flow in non-node_modules
      // (some dependencies may keep their flow comments, we don't want to match them)
      if (module.resource.indexOf("node_modules") < 0) {
        // We use webpack's cached FileSystem to avoid slowing down compilation
        loaderContext.fs.readFile(module.resource, function(err, data) {
          if (data && data.toString().indexOf('@flow') >= 0) {
            if (!this._flowInitialized) {
              this._initializeFlow(compiler.options.context);
              this._flowInitialized = true;
            }
            this._flowShouldRun = true;
          }
        }.bind(this));
      }
    }.bind(this))
  }.bind(this));

  // While emitting run a flow check if flow has been detected
  compiler.plugin('emit', function(compilation, callback) {
    // Only if a file with @ flow has been changed
    if (this._flowShouldRun) {
      this._flowOutput = this._flowCheck();
      this._flowShouldRun = false;
    }
    if (this._flowOutput.length > 0) {
      // In a CI, we wish to get flow breaking the build so we write errors here
      if (process.env.CI) {
        compilation.errors.push(this._flowOutput);
      } else {
        compilation.warnings.push(this._flowOutput);
      }
    }
    callback();
  }.bind(this));
};

// This initializer will run once per webpack run (runs once across all compilations)
FlowTypecheckPlugin.prototype._initializeFlow = function(projectPath) {
  const flowconfigPath = path.join(projectPath, '.flowconfig');
  fs.exists(flowconfigPath, function(exists) {
    if (!exists) {
      fs.writeFile(flowconfigPath, (this.options.flowconfig || []).join('\n'));
    }
  }.bind(this));
  // TODO: run flow-typed
  // TODO: start a flow instance
};

// This check will run each time a compilation sees a file with @ flow change
FlowTypecheckPlugin.prototype._flowCheck = function() {
  // TODO: run a single flow check
  return `
src/App.js:11
 11: f("abc");
     ^^^^^^^^ function call
 11: f("abc");
       ^^^^^ string. This type is incompatible with
  7: function f(x: number) {
                   ^^^^^^ number


Found 1 error
  `;
};

module.exports = FlowTypecheckPlugin;

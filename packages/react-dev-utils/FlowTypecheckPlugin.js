var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var flowBinPath = require('flow-bin');
const flowTypedPath = path.join(__dirname, 'node_modules', '.bin', 'flow-typed');

function FlowTypecheckPlugin(options) {
  options = options || {};
  // The flow-bin version
  this.flowVersion = options.flowVersion || 'latest';
  // Contents of the generated .flowconfig if it doesn't exist
  this.flowconfig = options.flowconfig || [];
  // Load up other flow-typed defs outside of the package.json (implicit packages behind react-scripts)
  // Key is the package name, value is the version number
  this.otherFlowTypedDefs = options.otherFlowTypedDefs || {};
  
  // If flow is globally present in the project, this will stay across compilations
  this._flowInitialized = false;
  // If flow should run in a current compilation
  this._flowShouldRun = false;
  // Stores the last flow output
  this._flowOutput = '';
  // Flow server process
  this._flowServer = null;
  this._flowServerStderr = '';
}

FlowTypecheckPlugin.prototype.apply = function(compiler) {
  compiler.plugin('compilation', (compilation, params) => {
    // Detect the presence of flow and initialize it
    compilation.plugin('normal-module-loader', (loaderContext, module) => {
      // We're only checking the presence of flow in non-node_modules
      // (some dependencies may keep their flow comments, we don't want to match them)
      if (module.resource.indexOf("node_modules") < 0) {
        // We use webpack's cached FileSystem to avoid slowing down compilation
        loaderContext.fs.readFile(module.resource, (err, data) => {
          if (data && data.toString().indexOf('@flow') >= 0) {
            if (!this._flowInitialized) {
              this._initializeFlow(compiler.options.context, this.flowVersion);
              this._flowInitialized = true;
            }
            this._flowShouldRun = true;
          }
        });
      }
    })
  });

  // While emitting run a flow check if flow has been detected
  compiler.plugin('emit', (compilation, callback) => {
    // Only if a file with @ flow has been changed
    if (this._flowShouldRun) {
      this._flowShouldRun = false;
      this._flowCheck(compiler.options.context, this.flowVersion, (err, flowOutput) => {
        if (err) {
          compilation.errors.push(err.message);
          return callback();
        }
        this._flowOutput = flowOutput;
        // Output a warning if flow failed
        if (this._flowOutput.indexOf('No errors!') < 0) {
          compilation.warnings.push(this._flowOutput);
        }
        callback();
      });
    } else {
      // Output a warning if flow failed in a previous run
      if (this._flowOutput.length > 0 && this._flowOutput.indexOf('No errors!') < 0) {
        compilation.warnings.push(this._flowOutput);
      }
      callback();
    }
  });
};

// This initializer will run once per webpack run (runs once across all compilations)
FlowTypecheckPlugin.prototype._initializeFlow = function(projectPath, flowVersion) {
  const flowconfigPath = path.join(projectPath, '.flowconfig');
  fs.exists(flowconfigPath, (exists) => {
    if (!exists) {
      fs.writeFile(flowconfigPath, this.flowconfig.join('\n'));
    }
  });
  childProcess.exec(
    flowTypedPath + ' install --overwrite --flowVersion=' + flowVersion,
    { cwd: projectPath }
  );
  Object.keys(this.otherFlowTypedDefs).forEach((packageName) => {
    childProcess.exec(
      flowTypedPath + ' install ' + packageName + '@' + this.otherFlowTypedDefs[packageName] + ' --overwrite --flowVersion=' + flowVersion,
      { cwd: projectPath }
    );
  })
  function spawnServer() {
    this._flowServer = childProcess.spawn(
      flowBinPath,
      ['server'],
      { cwd: projectPath }
    );
    this._flowServer.stderr.on('data', (chunk) => {
      this._flowServerStderr += chunk.toString();
    });
    this._flowServer.on('exit', () => {
      if (this._flowServerStderr.indexOf('Lib files changed')) {
        this._flowServerStderr = "";
        spawnServer();
      }
    });
  };
  spawnServer.call(this);
};

// This check will run each time a compilation sees a file with @ flow change
FlowTypecheckPlugin.prototype._flowCheck = function(projectPath, flowVersion, cb) {
  var flowOutput = "";
  var flowErrOutput = "";
  var statusCheck = childProcess.spawn(
    flowBinPath,
    ['status', '--no-auto-start', '--color=always'],
    { cwd: projectPath }
  );
  statusCheck.stdout.on('data', (chunk) => {
    flowOutput += chunk.toString();
  });
  statusCheck.stderr.on('data', (chunk) => {
    flowErrOutput += chunk.toString();
  });
  statusCheck.on('close', () => {
    if (flowErrOutput.length > 0) {
      if (flowErrOutput.indexOf("There is no Flow server running") >= 0) {
        return cb(new Error(
          'flow server: unexpectedly died.\n\n' +
          this._flowServerStderr +
          '\n' +
          'This is likely due to a version mismatch between a global flow ' +
          'server (that you or your IDE may try to run) and react-script\'s ' +
          'flow server.\n' +
          'You should run: \n' +
          'npm install -g flow-bin@' + flowVersion
        ));
      } else if(flowErrOutput.indexOf("still initializing") < 0) {
        return cb(new Error(flowErrOutput));
      }
    }
    cb(null, flowOutput);
  });
};

module.exports = FlowTypecheckPlugin;

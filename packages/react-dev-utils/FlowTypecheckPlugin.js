var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var flowBinPath = require('flow-bin');
const flowTypedPath = path.join(__dirname, 'node_modules', '.bin', 'flow-typed');

function execOneTime(command, args, options) {
  return new Promise((resolve) => {
    childProcess.exec(
      command + ' ' + (args || []).join(' '),
      (options || {}),
      (error, stdout, stderr) => {
        resolve({
          error: error,
          stdout: stdout,
          stderr: stderr
        });
      }
    )
  });
}

function writeFileIfDoesNotExist(path, data) {
  return new Promise((resolve, reject) => {
    fs.exists(path, exists => {
      if (!exists) {
        fs.writeFile(path, data, err => {
          if (err) {
            reject(err);
          }
          resolve(data);
        });
      }
    });
  });
}

function initializeFlow(projectPath, flowVersion, flowconfig, otherFlowTypedDefs) {
  const flowconfigPath = path.join(projectPath, '.flowconfig');
  Promise.all(
    [
      writeFileIfDoesNotExist(flowconfigPath, flowconfig.join('\n')),
      execOneTime(
        flowTypedPath,
        ['install', '--overwrite', '--flowVersion=' + flowVersion],
        { cwd: projectPath }
      )
    ].concat(
      Object.keys(otherFlowTypedDefs).map((packageName) => execOneTime(
        flowTypedPath,
        [
          'install',
          packageName + '@' + otherFlowTypedDefs[packageName],
          '--overwrite',
          '--flowVersion=' + flowVersion
        ],
        { cwd: projectPath }
      ))
    )
  );
}

function flowCheck(projectPath, flowVersion) {
  return execOneTime(
    flowBinPath,
    ['status', '--color=always'],
    { cwd: projectPath }
  )
  .then(res => {
    var flowOutput = res.stdout;
    var flowErrOutput = res.stderr;
    if (flowErrOutput.length > 0) {
      if(flowErrOutput.indexOf("still initializing") < 0) {
        return Promise.reject(new Error('flow server:\n' + flowErrOutput));
      }
    }
    return flowOutput;
  });
}


function FlowTypecheckPlugin(options) {
  options = options || {};
  // The flow-bin version
  this.flowVersion = options.flowVersion || 'latest';
  // Contents of the generated .flowconfig if it doesn't exist
  this.flowconfig = options.flowconfig || [];
  // Load up other flow-typed defs outside of the package.json (implicit packages behind react-scripts)
  // Key is the package name, value is the version number
  this.otherFlowTypedDefs = options.otherFlowTypedDefs || {};
}

FlowTypecheckPlugin.prototype.apply = function(compiler) {
  var flowInitialized = false;
  var flowShouldRun = false;
  var flowOutput = '';
  compiler.plugin('compilation', (compilation, params) => {
    // Detect the presence of flow and initialize it
    compilation.plugin('normal-module-loader', (loaderContext, module) => {
      // We're only checking the presence of flow in non-node_modules
      // (some dependencies may keep their flow comments, we don't want to match them)
      if (module.resource.indexOf("node_modules") < 0) {
        // We use webpack's cached FileSystem to avoid slowing down compilation
        loaderContext.fs.readFile(module.resource, (err, data) => {
          if (data && data.toString().indexOf('@flow') >= 0) {
            if (!flowInitialized) {
              initializeFlow(
                compiler.options.context, this.flowVersion,
                this.flowconfig, this.otherFlowTypedDefs
              );
              flowInitialized = true;
            }
            flowShouldRun = true;
          }
        });
      }
    })
  });

  // While emitting run a flow check if flow has been detected
  compiler.plugin('emit', (compilation, callback) => {
    // Only if a file with @ flow has been changed
    if (flowShouldRun) {
      flowShouldRun = false;
      flowCheck(compiler.options.context, this.flowVersion)
      .then(newOutput => {
        flowOutput = newOutput;
        // Output a warning if flow failed
        if (flowOutput.indexOf('No errors!') < 0) {
          compilation.warnings.push(flowOutput);
        }
        callback();
      }, (err) => {
        compilation.errors.push(err.message);
        callback();
      });
    } else {
      // Output a warning if flow failed in a previous run
      if (flowOutput.length > 0 && flowOutput.indexOf('No errors!') < 0) {
        compilation.warnings.push(flowOutput);
      }
      callback();
    }
  });
};

module.exports = FlowTypecheckPlugin;

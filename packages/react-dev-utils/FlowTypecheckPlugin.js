var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var flowBinPath = require('flow-bin');
const flowTypedPath = path.join(__dirname, 'node_modules', '.bin', 'flow-typed');

function stripFlowLoadingIndicators(message) {
  var newMessage = message;
  var launchingIndex = newMessage.indexOf("Launching Flow server for");
  if (launchingIndex >= 0) {
    newMessage = newMessage.slice(0, launchingIndex);
  }
  var stillIndex = newMessage.indexOf("flow is still initializing");
  if (stillIndex >= 0) {
    newMessage = newMessage.slice(0, stillIndex);
  }
  return newMessage;
}

function execOneTime(command, args, options) {
  return new Promise((resolve, reject) => {
    var stdout = new Buffer("");
    var stderr = new Buffer("");
    var oneTimeProcess = childProcess.spawn(
      command,
      args,
      options
    );
    oneTimeProcess.stdout.on('data', chunk => {
      stdout = Buffer.concat([stdout, chunk]);
    });
    oneTimeProcess.stderr.on('data', chunk => {
      stderr = Buffer.concat([stderr, chunk]);
    });
    oneTimeProcess.on('exit', code => {
      switch (code) {
        case 0:
          return resolve(stdout);
        default:
          return reject(new Error(
            Buffer.concat([stdout, stderr]).toString()
          ));
      }
    });
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
      } else {
        resolve(data);
      }
    });
  });
}

function getFlowPath(globalInstall) {
  return (
    globalInstall ?
      execOneTime(
        '/bin/sh',
        ['-c', 'which flow']
      )
      .then(rawPath => {
        var path = rawPath.toString().replace('\n', '');
        return path.indexOf("not found") >= 0 ?
          flowBinPath :
          path
      }) :
      Promise.resolve(flowBinPath)
  )
}

function getFlowVersion(options) {
  return getFlowPath((options || {}).globalInstall)
  .then(flowPath => execOneTime(
    flowPath,
    ['version', '--json']
  ))
  .then(rawData => JSON.parse(rawData))
  .then(versionData => versionData.semver);
}

function initializeFlow(projectPath, flowconfig, otherFlowTypedDefs) {
  const flowconfigPath = path.join(projectPath, '.flowconfig');
  return getFlowVersion().then(localVersion => Promise.all([
    writeFileIfDoesNotExist(flowconfigPath, flowconfig.join('\n')),
    execOneTime(
      flowTypedPath,
      ['install', '--overwrite', '--flowVersion=' + localVersion],
      { cwd: projectPath }
    )
  ].concat(
    Object.keys(otherFlowTypedDefs).map((packageName) => execOneTime(
      flowTypedPath,
      [
        'install',
        packageName + '@' + otherFlowTypedDefs[packageName],
        '--overwrite',
        '--flowVersion=' + localVersion
      ],
      { cwd: projectPath }
    ))
  )));
}

function flowCheck(projectPath) {
  return execOneTime(
    flowBinPath,
    ['status', '--color=always'],
    { cwd: projectPath }
  );
}

function FlowTypecheckPlugin(options) {
  options = options || {};
  // Contents of the generated .flowconfig if it doesn't exist
  this.flowconfig = options.flowconfig || [];
  // Load up other flow-typed defs outside of the package.json (implicit packages behind react-scripts)
  // Key is the package name, value is the version number
  this.otherFlowTypedDefs = options.otherFlowTypedDefs || {};
}

FlowTypecheckPlugin.prototype.apply = function(compiler) {
  var flowActiveOnProject = false;
  var flowInitialized = false;
  var flowInitializationPromise;
  var flowShouldRun = false;
  var flowErrorOutput = null;

  // During module traversal, assert the presence of an @ flow in a module
  compiler.plugin('compilation', (compilation, params) => {
    compilation.plugin('normal-module-loader', (loaderContext, module) => {
      // We're only checking the presence of flow in non-node_modules
      // (some dependencies may keep their flow comments, we don't want to match them)
      if (module.resource.indexOf("node_modules") < 0) {
        // We use webpack's cached FileSystem to avoid slowing down compilation
        loaderContext.fs.readFile(module.resource, (err, data) => {
          if (data && data.toString().indexOf('@flow') >= 0) {
            if (!flowActiveOnProject) {
              flowInitializationPromise = initializeFlow(
                compiler.options.context, this.flowconfig, this.otherFlowTypedDefs
              )
              .then(() => {
                flowInitialized = true;
              }, (e) => {
                loaderContext.emitWarning(new Error(
                  'Flow project initialization warning:\n' +
                  e.message
                ));
              });
              flowActiveOnProject = true;
            }
            flowShouldRun = true;
          }
        });
      }
    })
  });

  // While emitting, run a flow check if flow has been detected
  compiler.plugin('emit', (compilation, callback) => {
    // Only if a file with @ flow has been changed
    if (flowShouldRun) {
      flowShouldRun = false;
      (flowInitialized ?
        Promise.resolve() :
        flowInitializationPromise)
      .then(() => flowCheck(compiler.options.context))
      .then(() => {
        flowErrorOutput = null;
      }, error => {
        flowErrorOutput = stripFlowLoadingIndicators(error.message);
        compilation.warnings.push(flowErrorOutput);
      })
      .then(callback);
    } else {
      // Output a warning if flow failed in a previous run
      if (flowErrorOutput) {
        compilation.warnings.push(flowErrorOutput);
      }
      callback();
    }
  });
};

module.exports = FlowTypecheckPlugin;

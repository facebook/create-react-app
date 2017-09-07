/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const EventEmitter = require('events').EventEmitter;
const os = require('os');
const chalk = require('chalk');
const shellQuote = require('shell-quote');

// Inspired by https://github.com/rannn505/node-powershell
const EOI = 'EOI';
class PowerShell extends EventEmitter {
  constructor() {
    super();

    this._proc = child_process.spawn(
      'powershell.exe',
      ['-NoLogo', '-NoProfile', '-NoExit', '-Command', '-'],
      {
        stdio: 'pipe',
      }
    );

    this._proc.on('error', () => {
      // Needs to be registered... already catched by if-statement below
    });

    if (!this._proc.pid) {
      throw new Error('Failed to start PowerShell');
    }

    let output = [];
    this._proc.stdout.on('data', data => {
      if (data.indexOf(EOI) !== -1) {
        this.emit('resolve', output.join(''));
        output = [];
      } else {
        output.push(data);
      }
    });
  }

  invoke(cmd) {
    return new Promise(resolve => {
      this.on('resolve', data => {
        resolve(data);
        this.removeAllListeners('resolve');
      });

      this._proc.stdin.write(cmd);
      this._proc.stdin.write(os.EOL);
      this._proc.stdin.write(`echo ${EOI}`);
      this._proc.stdin.write(os.EOL);
    });
  }
}

function isTerminalEditor(editor) {
  switch (editor) {
    case 'vim':
    case 'emacs':
    case 'nano':
      return true;
  }
  return false;
}

// Map from full process name to binary that starts the process
// We can't just re-use full process name, because it will spawn a new instance
// of the app every time
const COMMON_EDITORS_OSX = {
  '/Applications/Atom.app/Contents/MacOS/Atom': 'atom',
  '/Applications/Atom Beta.app/Contents/MacOS/Atom Beta':
    '/Applications/Atom Beta.app/Contents/MacOS/Atom Beta',
  '/Applications/Brackets.app/Contents/MacOS/Brackets': 'brackets',
  '/Applications/Sublime Text.app/Contents/MacOS/Sublime Text':
    '/Applications/Sublime Text.app/Contents/SharedSupport/bin/subl',
  '/Applications/Sublime Text 2.app/Contents/MacOS/Sublime Text 2':
    '/Applications/Sublime Text 2.app/Contents/SharedSupport/bin/subl',
  '/Applications/Visual Studio Code.app/Contents/MacOS/Electron': 'code',
  '/Applications/AppCode.app/Contents/MacOS/appcode':
    '/Applications/AppCode.app/Contents/MacOS/appcode',
  '/Applications/CLion.app/Contents/MacOS/clion':
    '/Applications/CLion.app/Contents/MacOS/clion',
  '/Applications/IntelliJ IDEA.app/Contents/MacOS/idea':
    '/Applications/IntelliJ IDEA.app/Contents/MacOS/idea',
  '/Applications/PhpStorm.app/Contents/MacOS/phpstorm':
    '/Applications/PhpStorm.app/Contents/MacOS/phpstorm',
  '/Applications/PyCharm.app/Contents/MacOS/pycharm':
    '/Applications/PyCharm.app/Contents/MacOS/pycharm',
  '/Applications/PyCharm CE.app/Contents/MacOS/pycharm':
    '/Applications/PyCharm CE.app/Contents/MacOS/pycharm',
  '/Applications/RubyMine.app/Contents/MacOS/rubymine':
    '/Applications/RubyMine.app/Contents/MacOS/rubymine',
  '/Applications/WebStorm.app/Contents/MacOS/webstorm':
    '/Applications/WebStorm.app/Contents/MacOS/webstorm',
};

const COMMON_EDITORS_WIN = [
  'Brackets.exe',
  'Code.exe',
  'atom.exe',
  'sublime_text.exe',
  'notepad++.exe',
  'clion.exe',
  'clion64.exe',
  'idea.exe',
  'idea64.exe',
  'phpstorm.exe',
  'phpstorm64.exe',
  'pycharm.exe',
  'pycharm64.exe',
  'rubymine.exe',
  'rubymine64.exe',
  'webstorm.exe',
  'webstorm64.exe',
];

function addWorkspaceToArgumentsIfExists(args, workspace) {
  if (workspace) {
    args.unshift(workspace);
  }
  return args;
}

function getArgumentsForLineNumber(editor, fileName, lineNumber, workspace) {
  const editorBasename = path.basename(editor).replace(/\.(exe|cmd|bat)$/i, '');
  switch (editorBasename) {
    case 'atom':
    case 'Atom':
    case 'Atom Beta':
    case 'subl':
    case 'sublime':
    case 'sublime_text':
    case 'wstorm':
    case 'charm':
      return [fileName + ':' + lineNumber];
    case 'notepad++':
      return ['-n' + lineNumber, fileName];
    case 'vim':
    case 'mvim':
    case 'joe':
    case 'emacs':
    case 'emacsclient':
      return ['+' + lineNumber, fileName];
    case 'rmate':
    case 'mate':
    case 'mine':
      return ['--line', lineNumber, fileName];
    case 'code':
    case 'Code':
      return addWorkspaceToArgumentsIfExists(
        ['-g', fileName + ':' + lineNumber],
        workspace
      );
    case 'appcode':
    case 'clion':
    case 'clion64':
    case 'idea':
    case 'idea64':
    case 'phpstorm':
    case 'phpstorm64':
    case 'pycharm':
    case 'pycharm64':
    case 'rubymine':
    case 'rubymine64':
    case 'webstorm':
    case 'webstorm64':
      return addWorkspaceToArgumentsIfExists(
        ['--line', lineNumber, fileName],
        workspace
      );
  }

  // For all others, drop the lineNumber until we have
  // a mapping above, since providing the lineNumber incorrectly
  // can result in errors or confusing behavior.
  return [fileName];
}

let powerShellAgent = null;
function tryLaunchPowerShellAgent() {
  if (!powerShellAgent) {
    try {
      powerShellAgent = new PowerShell();
    } catch (err) {
      // Failed to start, ignore silent...
      powerShellAgent = null;
    }
  }
}

function guessEditor() {
  return Promise.resolve().then(() => {
    // Using `ps x` on OSX or `Get-Process` on Windows we can find out which editor is currently running.
    // Potentially we could use similar technique for Linux
    if (process.platform === 'darwin') {
      try {
        const output = child_process.execSync('ps x').toString();
        const processNames = Object.keys(COMMON_EDITORS_OSX);
        for (let i = 0; i < processNames.length; i++) {
          const processName = processNames[i];
          if (output.indexOf(processName) !== -1) {
            return COMMON_EDITORS_OSX[processName];
          }
        }
      } catch (error) {
        // Ignore...
      }
    } else if (process.platform === 'win32' && powerShellAgent) {
      return powerShellAgent
        .invoke('Get-Process | Select-Object Path')
        .then(output => {
          const runningProcesses = output.split('\r\n');
          for (let i = 0; i < runningProcesses.length; i++) {
            // `Get-Process` sometimes returns empty lines
            if (!runningProcesses[i]) {
              continue;
            }

            const fullProcessPath = runningProcesses[i].trim();
            const shortProcessName = path.basename(fullProcessPath);

            if (COMMON_EDITORS_WIN.indexOf(shortProcessName) !== -1) {
              return fullProcessPath;
            }
          }
        });
    }
  });
}

function tryGetEditor() {
  // Explicit config always wins
  if (process.env.REACT_EDITOR) {
    return Promise.resolve(shellQuote.parse(process.env.REACT_EDITOR));
  }

  return guessEditor().then(editor => {
    if (editor) {
      return [editor];
    } else {
      // Last resort, use old skool env vars
      if (process.env.VISUAL) {
        return [process.env.VISUAL];
      } else if (process.env.EDITOR) {
        return [process.env.EDITOR];
      }

      return [null];
    }
  });
}

function printInstructions(fileName, errorMessage) {
  console.log();
  console.log(
    chalk.red('Could not open ' + path.basename(fileName) + ' in the editor.')
  );
  if (errorMessage) {
    if (errorMessage[errorMessage.length - 1] !== '.') {
      errorMessage += '.';
    }
    console.log(
      chalk.red('The editor process exited with an error: ' + errorMessage)
    );
  }
  console.log();
  console.log(
    'To set up the editor integration, add something like ' +
      chalk.cyan('REACT_EDITOR=atom') +
      ' to the ' +
      chalk.green('.env.local') +
      ' file in your project folder ' +
      'and restart the development server. Learn more: ' +
      chalk.green('https://goo.gl/MMTaZt')
  );
  console.log();
}

let _childProcess = null;
function launchEditor(fileName, lineNumber) {
  if (!fs.existsSync(fileName)) {
    return;
  }

  // Sanitize lineNumber to prevent malicious use on win32
  // via: https://github.com/nodejs/node/blob/c3bb4b1aa5e907d489619fb43d233c3336bfc03d/lib/child_process.js#L333
  if (lineNumber && isNaN(lineNumber)) {
    return;
  }

  tryGetEditor().then(([editor, ...args]) => {
    if (!editor) {
      printInstructions(fileName, null);
      return;
    }

    if (
      process.platform === 'linux' &&
      fileName.startsWith('/mnt/') &&
      /Microsoft/i.test(os.release())
    ) {
      // Assume WSL / "Bash on Ubuntu on Windows" is being used, and
      // that the file exists on the Windows file system.
      // `os.release()` is "4.4.0-43-Microsoft" in the current release
      // build of WSL, see: https://github.com/Microsoft/BashOnWindows/issues/423#issuecomment-221627364
      // When a Windows editor is specified, interop functionality can
      // handle the path translation, but only if a relative path is used.
      fileName = path.relative('', fileName);
    }

    let workspace = null;
    if (lineNumber) {
      args = args.concat(
        getArgumentsForLineNumber(editor, fileName, lineNumber, workspace)
      );
    } else {
      args.push(fileName);
    }

    if (_childProcess && isTerminalEditor(editor)) {
      // There's an existing editor process already and it's attached
      // to the terminal, so go kill it. Otherwise two separate editor
      // instances attach to the stdin/stdout which gets confusing.
      _childProcess.kill('SIGKILL');
    }

    if (process.platform === 'win32') {
      // On Windows, launch the editor in a shell because spawn can only
      // launch .exe files.
      _childProcess = child_process.spawn(
        'cmd.exe',
        ['/C', editor].concat(args),
        { stdio: 'inherit' }
      );
    } else {
      _childProcess = child_process.spawn(editor, args, { stdio: 'inherit' });
    }
    _childProcess.on('exit', function(errorCode) {
      _childProcess = null;

      if (errorCode) {
        printInstructions(fileName, '(code ' + errorCode + ')');
      }
    });

    _childProcess.on('error', function(error) {
      printInstructions(fileName, error.message);
    });
  });
}

module.exports = {
  launchEditor,
  tryLaunchPowerShellAgent,
};

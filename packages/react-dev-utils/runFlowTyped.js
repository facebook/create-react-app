#!/usr/bin/env node
var flowTyped = require('flow-typed');
var fs = require('fs');
var path = require('path');

// Extracted from flow-typed repository: https://github.com/flowtype/flow-typed/blob/master/cli/src/cli.js#L67
/**
 * Look to see if the CWD is within an npm project. If it is, and that project
 * has a flow-typed CLI `npm install`ed, use that version instead of the global
 * version of the CLI.
 */
const CWD = process.cwd();
let currDir = CWD;
let lastDir = null;
while (currDir !== lastDir) {
  const localCLIPath = path.join(currDir, 'node_modules', '.bin', 'flow-typed');
  try {
    if (fs.statSync(localCLIPath).isFile()) {
      flowTyped.runCLI = require.call(null, localCLIPath).runCLI;
      break;
    }
  } catch (e) { /* File doesn't exist, move up a dir... */ }
  lastDir = currDir;
  currDir = path.resolve(currDir, '..');
}
flowTyped.runCLI();

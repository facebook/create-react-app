// Largely adapted from https://github.com/trunkclub/tcweb-build/blob/master/src/cli/validators/node-validator.es6
var cp = require('child_process');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

function clean(str) {
  return str.replace(/\n/, '');
}

function checkNodeVersion (dir) {
  var actualVersion = clean(cp.execSync('node -v', { env: process.env }).toString('utf8'));
  var nvmrcVersion = clean(fs.readFileSync(path.join(dir, '.nvmrc'), 'utf8'));

  if (actualVersion !== nvmrcVersion) {
    console.log();
    console.log(chalk.red('Node versions do not match!'));
    console.log();
    console.log('  Exepected: ' + nvmrcVersion);
    console.log('  Actual:    ' + actualVersion);
    console.log();
    console.log('Run `nvm install` and try again');
    console.log();
    process.exit(1);
  }
}

module.exports = checkNodeVersion;

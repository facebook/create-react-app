const execa = require('execa');
const fs = require('fs-extra');
const getPort = require('get-port');
const path = require('path');
const os = require('os');
const stripAnsi = require('strip-ansi');

function execaSafe(...args) {
  return execa(...args)
    .then(({ stdout, stderr, ...rest }) => ({
      fulfilled: true,
      stdout: stripAnsi(stdout),
      stderr: stripAnsi(stderr),
      ...rest,
    }))
    .catch(err => ({
      rejected: true,
      reason: err,
      stdout: '',
      stderr: stripAnsi(
        err.message
          .split(os.EOL)
          .slice(2)
          .join(os.EOL)
      ),
    }));
}

module.exports = class ReactScripts {
  constructor(root) {
    this.root = root;
  }

  async build({ env = {} } = {}) {
    return await execaSafe('./node_modules/.bin/react-scripts', ['build'], {
      cwd: this.root,
      env: Object.assign({}, { CI: 'false', FORCE_COLOR: '0' }, env),
    });
  }
};

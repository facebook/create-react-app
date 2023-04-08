'use strict';

const execa = require('execa');
const getPort = require('get-port');
const stripAnsi = require('strip-ansi');
const waitForLocalhost = require('wait-for-localhost');

function execaSafe(...args) {
  return execa(...args)
    .then(({ stdout, stderr, ...rest }) => ({
      fulfilled: true,
      rejected: false,
      stdout: stripAnsi(stdout),
      stderr: stripAnsi(stderr),
      ...rest,
    }))
    .catch(err => ({
      fulfilled: false,
      rejected: true,
      reason: err,
      stdout: '',
      stderr: stripAnsi(err.message.split('\n').slice(2).join('\n')),
    }));
}

module.exports = class ReactScripts {
  constructor(root) {
    this.root = root;
  }

  async start({ smoke = false, env = {} } = {}) {
    const port = await getPort();
    const options = {
      cwd: this.root,
      env: Object.assign(
        {},
        {
          CI: 'false',
          FORCE_COLOR: '0',
          BROWSER: 'none',
          PORT: port,
        },
        env
      ),
    };

    if (smoke) {
      return await execaSafe('npm', ['start', '--smoke-test'], options);
    }
    const startProcess = execa('npm', ['start'], options);
    await waitForLocalhost({ port });
    return {
      port,
      done() {
        startProcess.kill('SIGKILL');
      },
    };
  }

  async build({ env = {} } = {}) {
    return await execaSafe('npm', ['run', 'build'], {
      cwd: this.root,
      env: Object.assign({}, { CI: 'false', FORCE_COLOR: '0' }, env),
    });
  }

  async serve() {
    const port = await getPort();
    const serveProcess = execa(
      'npm',
      ['run', 'serve', '--', '-p', port, '-s', 'build/'],
      {
        cwd: this.root,
      }
    );
    await waitForLocalhost({ port });
    return {
      port,
      done() {
        serveProcess.kill('SIGKILL');
      },
    };
  }

  async test({ jestEnvironment = 'jsdom', env = {} } = {}) {
    return await execaSafe('npm', ['test', '--env', jestEnvironment, '--ci'], {
      cwd: this.root,
      env: Object.assign({}, { CI: 'true' }, env),
    });
  }
};

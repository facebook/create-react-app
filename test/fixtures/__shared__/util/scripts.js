const execa = require('execa');
const getPort = require('get-port');
const os = require('os');
const stripAnsi = require('strip-ansi');

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
      return await execaSafe(
        'yarnpkg',
        ['--silent', 'start', '--smoke-test'],
        options
      );
    }
    const startProcess = execa('yarnpkg', ['--silent', 'start'], options);
    await new Promise(resolve => setTimeout(resolve, 2000)); // let dev server warm up
    return {
      port,
      done() {
        startProcess.kill('SIGKILL');
      },
    };
  }

  async build({ env = {} } = {}) {
    return await execaSafe('yarnpkg', ['--silent', 'build'], {
      cwd: this.root,
      env: Object.assign({}, { CI: 'false', FORCE_COLOR: '0' }, env),
    });
  }

  async serve() {
    const port = await getPort();
    const serveProcess = execa(
      'yarnpkg',
      ['--silent', 'serve-static', '-p', port],
      {
        cwd: this.root,
      }
    );
    await new Promise(resolve => setTimeout(resolve, 1000)); // let serve warm up
    return {
      port,
      done() {
        serveProcess.kill('SIGKILL');
      },
    };
  }

  async test({ jestEnvironment = 'jsdom', env = {} } = {}) {
    return await execaSafe(
      'yarnpkg',
      ['--silent', 'test', '--env', jestEnvironment, '--ci'],
      {
        cwd: this.root,
        env: Object.assign({}, { CI: 'true' }, env),
      }
    );
  }
};

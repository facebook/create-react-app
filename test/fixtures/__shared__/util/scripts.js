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
    return await execaSafe(
      './node_modules/.bin/react-scripts',
      ['start', smoke && '--smoke-test'].filter(Boolean),
      {
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
      }
    );
  }

  async build({ env = {} } = {}) {
    return await execaSafe('./node_modules/.bin/react-scripts', ['build'], {
      cwd: this.root,
      env: Object.assign({}, { CI: 'false', FORCE_COLOR: '0' }, env),
    });
  }

  async test({ jestEnvironment = 'jsdom', env = {} } = {}) {
    return await execaSafe(
      './node_modules/.bin/react-scripts',
      ['test', '--env', jestEnvironment, '--ci'],
      {
        cwd: this.root,
        env: Object.assign({}, { CI: 'true' }, env),
      }
    );
  }
};

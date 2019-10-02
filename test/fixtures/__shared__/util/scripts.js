const execa = require('execa');
const getPort = require('get-port');
const os = require('os');
const stripAnsi = require('strip-ansi');
const waitForLocalhost = require('wait-for-localhost');

function stripYarn(output) {
  let lines = output.split('\n');

  let runIndex = lines.findIndex(line => line.match(/^yarn run/));
  if (runIndex !== -1) {
    lines.splice(0, runIndex + 2);
    lines = lines.filter(line => !line.match(/^info Visit.*yarnpkg/));
  }

  return lines.join('\n');
}

function execaSafe(...args) {
  return execa(...args)
    .then(({ stdout, stderr, ...rest }) => ({
      fulfilled: true,
      rejected: false,
      stdout: stripYarn(stripAnsi(stdout)),
      stderr: stripYarn(stripAnsi(stderr)),
      ...rest,
    }))
    .catch(err => ({
      fulfilled: false,
      rejected: true,
      reason: err,
      stdout: '',
      stderr: stripYarn(
        stripAnsi(
          err.message
            .split('\n')
            .slice(2)
            .join('\n')
        )
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
      return await execaSafe('yarnpkg', ['start', '--smoke-test'], options);
    }
    const startProcess = execa('yarnpkg', ['start'], options);
    await waitForLocalhost({ port });
    return {
      port,
      done() {
        startProcess.kill('SIGKILL');
      },
    };
  }

  async build({ env = {} } = {}) {
    return await execaSafe('yarnpkg', ['build'], {
      cwd: this.root,
      env: Object.assign({}, { CI: 'false', FORCE_COLOR: '0' }, env),
    });
  }

  async serve() {
    const port = await getPort();
    const serveProcess = execa(
      'yarnpkg',
      ['serve', '--', '-p', port, '-s', 'build/'],
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
    return await execaSafe(
      'yarnpkg',
      ['test', '--env', jestEnvironment, '--ci'],
      {
        cwd: this.root,
        env: Object.assign({}, { CI: 'true' }, env),
      }
    );
  }
};

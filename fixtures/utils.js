const execa = require('execa');
const fs = require('fs-extra');
const getPort = require('get-port');
const path = require('path');
const os = require('os');
const stripAnsi = require('strip-ansi');

async function bootstrap({ directory, template }) {
  await Promise.all(
    ['public/', 'src/', 'package.json'].map(async file =>
      fs.copy(path.join(template, file), path.join(directory, file))
    )
  );
  await execa('yarnpkg', ['install', '--mutex', 'network'], { cwd: directory });
}

async function isSuccessfulDevelopment({ directory }) {
  const { stdout, stderr } = await execa(
    './node_modules/.bin/react-scripts',
    ['start', '--smoke-test'],
    {
      cwd: directory,
      env: { BROWSER: 'none', PORT: await getPort() },
    }
  );

  if (!/Compiled successfully/.test(stdout)) {
    throw new Error(`stdout: ${stdout}${os.EOL + os.EOL}stderr: ${stderr}`);
  }
}

async function isSuccessfulProduction({ directory }) {
  const { stdout, stderr } = await execa(
    './node_modules/.bin/react-scripts',
    ['build'],
    {
      cwd: directory,
    }
  );

  if (!/Compiled successfully/.test(stdout)) {
    throw new Error(`stdout: ${stdout}${os.EOL + os.EOL}stderr: ${stderr}`);
  }
}

async function getOutputProduction({ directory, env = {} }) {
  try {
    const { stdout, stderr } = await execa(
      './node_modules/.bin/react-scripts',
      ['build'],
      {
        cwd: directory,
        env: Object.assign({}, { CI: 'false', FORCE_COLOR: '0' }, env),
      }
    );
    return { stdout: stripAnsi(stdout), stderr: stripAnsi(stderr) };
  } catch (err) {
    return {
      stdout: '',
      stderr: stripAnsi(
        err.message
          .split(os.EOL)
          .slice(2)
          .join(os.EOL)
      ),
    };
  }
}

module.exports = {
  bootstrap,
  isSuccessfulDevelopment,
  isSuccessfulProduction,
  getOutputProduction,
};

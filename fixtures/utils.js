const execa = require('execa');
const fs = require('fs-extra');
const getPort = require('get-port');
const path = require('path');
const os = require('os');

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
      { cwd: directory, env: Object.assign({}, { FORCE_COLOR: '1' }, env) }
    );
    return { stdout, stderr };
  } catch (err) {
    return {
      stdout: '',
      stderr: err.message
        .split('\n')
        .slice(2)
        .join('\n'),
    };
  }
}

module.exports = {
  bootstrap,
  isSuccessfulDevelopment,
  isSuccessfulProduction,
  getOutputProduction,
};

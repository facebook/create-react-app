const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

async function bootstrap({ directory, template }) {
  await Promise.all(
    ['public/', 'src/', 'package.json'].map(async file =>
      fs.copy(path.join(template, file), path.join(directory, file))
    )
  );
  await execa('yarnpkg', ['install'], { cwd: directory });
}

async function isSuccessfulDevelopment({ directory }) {
  const { stdout, stderr } = await execa(
    './node_modules/.bin/react-scripts',
    ['start', '--smoke-test'],
    {
      cwd: directory,
      env: { BROWSER: 'none' },
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

module.exports = { bootstrap, isSuccessfulDevelopment, isSuccessfulProduction };

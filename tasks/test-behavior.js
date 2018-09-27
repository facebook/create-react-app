'use strict';

const args = process.argv.slice(2);
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const spawn = require('cross-spawn');

const applicationPath = args.pop();
const applicationPackageJson = path.resolve(applicationPath, 'package.json');
const applicationSrc = path.resolve(applicationPath, 'src');
const applicationModules = path.resolve(applicationPath, 'node_modules');

const fixturePath = path.resolve(__dirname, '..', 'fixtures', 'behavior');
const fixtures = fs
  .readdirSync(fixturePath)
  .map(fixture => path.resolve(fixturePath, fixture))
  .filter(path => fs.lstatSync(path).isDirectory);

const packageContents = require(applicationPackageJson);

function install({ root }) {
  spawn.sync('yarnpkg', ['--cwd', root, 'install'], { cwd: root });
}

function startApp({ root }) {
  const output = spawn
    .sync('yarnpkg', ['start', '--smoke-test'], { cwd: root })
    .output.join('');

  if (!/Compiled successfully/.test(output)) {
    throw new Error(output);
  }

  console.log('\t = application started: ', output);
}

function buildApp({ root }) {
  const output = spawn
    .sync('yarnpkg', ['build'], { cwd: root })
    .output.join('');

  if (!/Compiled successfully/.test(output)) {
    throw new Error(output);
  }

  console.log('\t = application built: ', output);
}

console.log(`=> checking ${fixtures.length} fixtures`);
for (const fixture of fixtures) {
  const {
    name,
    description,
    dependencies,
    devDependencies,
  } = require(path.resolve(fixture, 'package.json'));
  console.log(`\t * checking fixture ${name}`);
  console.log(`\t ... this fixture: ${description}`);

  fs.emptyDirSync(applicationSrc);
  fs.emptyDirSync(applicationModules);
  fs.copySync(path.resolve(fixture, 'src'), applicationSrc);

  try {
    fs.writeJsonSync(
      applicationPackageJson,
      Object.assign({}, packageContents, {
        dependencies: Object.assign(
          {},
          packageContents.dependencies,
          dependencies
        ),
        devDependencies: Object.assign(
          {},
          packageContents.devDependencies,
          devDependencies
        ),
      }),
      {
        spaces: 2,
        EOL: os.EOL,
      }
    );
    install({ root: applicationPath });
    startApp({ root: applicationPath });
    buildApp({ root: applicationPath });
  } catch (e) {
    console.error(`\t ! failed on ${name}:`);
    throw e;
  } finally {
    fs.writeJsonSync(applicationPackageJson, packageContents, {
      spaces: 2,
      EOL: os.EOL,
    });
  }
}

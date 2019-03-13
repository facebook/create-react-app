'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const fsCli = require('fs-cli-goodies');
const inquirer = require('inquirer');
const osUtils = require('./osUtils');

module.exports = {
  installFrontierDependencies,
  promptForConfig,
  packageJsonWritten,
};

const polymerFromCDNCode = `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.2.7/webcomponents-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.2.7/custom-elements-es5-adapter.js"></script>
 `;
const depsToInstall = [];
const devDepsToInstall = [];

async function promptForConfig() {
  console.log(fsCli.fsLogo('Frontier React Scripts'));
  const questions = [
    {
      type: 'checkbox',
      name: 'additionalFeatures',
      message: 'What additional features does your app require (these are checkboxes)',
      default: ['electric-flow', 'header-footer'],
      choices: [
        {
          name: `Configure app for Electric Flow`,
          value: 'electric-flow',
        },
        {
          name: `Include hf (header/footer)`,
          value: 'header-footer',
        },
        {
          name: 'Using a shared Polymer Component within your React App?',
          value: 'polymer',
        },
      ],
    },
  ];
  const answers = await inquirer.prompt(questions);
  return answers;
}

function packageJsonWritten() {}

function installFrontierDependencies(appPath, answers, ownPath) {
  const { additionalFeatures } = answers;
  const usePolymer = additionalFeatures.includes('polymer');
  const useEF = additionalFeatures.includes('electric-flow');
  const useHF = additionalFeatures.includes('header-footer');

  //it doesn't make sense to use header-footer without setting up electric-flow but theoretically
  //it might be useful to setup electric-flow without header-footer
  if (useEF || useHF) {
    configureEF(appPath, ownPath);
  }
  if (useHF) {
    configureHF(appPath, ownPath);
  }
  // we always call this handle function. If usePolymer is false, it will remove the comments that we manually placed in the index file
  handlePolymerCodeAndComments(appPath, usePolymer, useHF);

  depsToInstall.push(
    ...[
      '@fs/axios',
      '@fs/user',
      'fs-webdev/exo',
      'http-proxy-middleware@0.19.1',
      '@reach/router@1.2.1',
      '@emotion/core@10.0.9',
    ]
  );
  devDepsToInstall.push(
    ...[
      '@fs/eslint-config-frontier-react',
      '@fs/testing-library',
      'eslint@5.12.0',
      'react-styleguidist@9.0.4',
      'webpack@4.28.3',
      'jest-dom@3.1.3',
    ]
  );

  alterPackageJsonFile(appPath, appPackage => {
    const packageJson = { ...appPackage };
    const additionalScripts = {
      styleguide: 'styleguidist server --open',
      'styleguide:build': 'styleguidist build',
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
      test: `eslint src/ && ${packageJson.scripts.test}`,
    };
    packageJson.scripts = { ...packageJson.scripts, ...additionalScripts };
    delete packageJson.scripts.eject;
    packageJson.eslintConfig = {
      extends: ['@fs/eslint-config-frontier-react'],
    };
    return packageJson;
  });
  installModulesSync(depsToInstall);
  installModulesSync(devDepsToInstall, true);
}

function handlePolymerCodeAndComments(appPath, usePolymer, useHF) {
  let filePath = 'public/index.html';
  if (useHF) {
    filePath = 'views/index.ejs';
  }

  if (usePolymer) {
    replaceComment(appPath, filePath, polymerFromCDNCode);
  } else {
    replaceComment(appPath, filePath, '');
  }
}

function alterPackageJsonFile(appPath, extendFunction) {
  let appPackage = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json'), 'UTF8'));
  appPackage = extendFunction(appPackage);
  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );
}

function replaceComment(appPath, fileToInjectIntoPath, stringToInject) {
  const indexPath = path.join(appPath, fileToInjectIntoPath);
  let indexCode = fs.readFileSync(indexPath, 'UTF8');

  indexCode = indexCode.replace(
    '<!--FRONTIER WEBCOMPONENT LOADER CODE FRONTIER -->',
    stringToInject
  );
  fs.writeFileSync(indexPath, indexCode);
}

function configureEF(appPath, ownPath) {
  // TODO - modify package.json to make sure name is correct for blueprint
  // TODO - use blueprint.yml as a template

  const templatePath = path.join(ownPath, 'template-ef');
  fs.copySync(templatePath, appPath, { overwrite: true });

  depsToInstall.push(...['express@4.16.4']);
}

function configureHF(appPath, ownPath) {
  const templatePath = path.join(ownPath, 'template-hf');
  fs.copySync(templatePath, appPath, { overwrite: true });

  alterPackageJsonFile(appPath, appPackage => {
    const packageJson = { ...appPackage };
    const additionalScripts = {
      'build:prod': 'PUBLIC_URL=https://edge.fscdn.org/assets/ react-scripts build',
      'heroku-postbuild': 'npm run build:prod',
      start: 'react-scripts start',
    };
    packageJson.scripts = sortScripts({ ...packageJson.scripts, ...additionalScripts });
    packageJson.main = './server.js';
    packageJson.engines = { node: '10' };

    return packageJson;
  });

  createLocalEnvFile();
  depsToInstall.push(
    ...['github:fs-webdev/hf#cra', 'github:fs-webdev/snow#cra', 'github:fs-webdev/startup']
  );
}

function installModulesSync(modules, saveDev = false) {
  const command = 'npm';
  const args = ['install', `--save${saveDev ? '-dev' : ''}`].concat(modules);
  osUtils.runExternalCommandSync(command, args);
}

function createLocalEnvFile() {
  osUtils.runExternalCommandSync('npx', ['@fs/fr-cli', 'env', 'local']);
}

function sortScripts(scripts) {
  const sortedScripts = {};
  Object.keys(scripts)
    .sort()
    .forEach(function(key) {
      sortedScripts[key] = scripts[key];
    });
  return sortedScripts;
}

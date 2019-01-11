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
  cleanupFrontierCode,
};

async function promptForConfig() {
  console.log(fsCli.fsLogo('Frontier React Scripts'));
  const questions = [
    {
      type: 'checkbox',
      name: 'additionalFeatures',
      message: 'What additional features does your app require',
      choices: [
        {
          value: 'polymer',
          name: 'Using a shared Polymer Component?',
        },
        {
          name: 'Redux',
          value: 'redux',
        },
      ],
    },
  ];
  const answers = await inquirer.prompt(questions);
  return answers;
}

function packageJsonWritten() {}

function installFrontierDependencies(appPath, answers, useYarn, ownPath) {
  const { additionalFeatures } = answers;

  if (additionalFeatures.includes('polymer')) {
    configurePolymer(appPath, useYarn);
  }
  if (additionalFeatures.includes('redux')) {
    configureRedux(appPath, useYarn, ownPath);
  }
  injectPolymerCode(appPath);

  const defaultModules = [
    'http-proxy-middleware@0.19.0',
    'react-router-dom@4.3.1',
    'fs-webdev/exo',
  ];
  const defaultDevModules = ['react-styleguidist'];

  installModulesSync(defaultModules, useYarn);
  installModulesSync(defaultDevModules, useYarn, true);
  addStyleguidistScriptsToPackageJson(appPath);
}

function addStyleguidistScriptsToPackageJson(appPath) {
  const appPackage = require(path.join(appPath, 'package.json'));

  appPackage.scripts.styleguide = 'styleguidist server';
  appPackage.scripts['styleguide:build'] = 'styleguidist build';

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );
}

function configurePolymer(appPath, useYarn) {
  const appPackage = require(path.join(appPath, 'package.json'));
  appPackage.vendorCopy = [
    {
      from:
        'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
      to: 'public/vendor/custom-elements-es5-adapter.js',
    },
    {
      from:
        'node_modules/@webcomponents/webcomponentsjs/webcomponents-bundle.js',
      to: 'public/vendor/webcomponents-bundle.js',
    },
  ];

  const { postinstall } = appPackage.scripts;
  appPackage.scripts.postinstall = postinstall
    ? `${postinstall} && `
    : '' + 'vendor-copy';

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );

  const polymerModules = [
    'vendor-copy@2.0.0',
    '@webcomponents/webcomponentsjs@2.1.3',
  ];
  installModulesSync(polymerModules, useYarn, true);
}

function injectPolymerCode(appPath) {
  const indexPath = path.join(appPath, 'public/index.html');
  const polymerCode = `
    <script src="%PUBLIC_URL%/vendor/webcomponents-bundle.js"></script>
    <script src="%PUBLIC_URL%/vendor/custom-elements-es5-adapter.js"></script>
 `;

  let indexHtml = fs.readFileSync(indexPath, 'UTF8');
  indexHtml = indexHtml.replace(
    '<!--FRONTIER WEBCOMPONENT LOADER CODE FRONTIER -->',
    polymerCode
  );
  fs.writeFileSync(indexPath, indexHtml);
}

function configureRedux(appPath, useYarn, ownPath) {
  const reduxModules = [
    'redux@4.0.0',
    'react-redux@5.0.7',
    'redux-logger@3.0.6',
    'redux-thunk@2.3.0',
  ];
  installModulesSync(reduxModules, useYarn);

  const templatePath = path.join(ownPath, 'template-redux');
  fs.copySync(templatePath, appPath, { overwrite: true });
}

function cleanupFrontierCode(appPath) {}

function installModulesSync(modules, useYarn, saveDev = false) {
  const { command, args } = buildInstallCommandAndArgs(useYarn, saveDev);
  osUtils.runExternalCommandSync(command, args.concat(modules));
}

function buildInstallCommandAndArgs(useYarn, saveDev = false) {
  let command;
  let args;
  if (useYarn) {
    command = 'yarnpkg';
    args = ['add'];
    if (saveDev) {
      args.push('--dev');
    }
  } else {
    command = 'npm';
    args = ['install', '--save'];
    if (saveDev) {
      args[1] = '--save-dev';
    }
  }
  return { command, args };
}

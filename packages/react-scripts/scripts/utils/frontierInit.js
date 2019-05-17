'use strict'

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const fsCli = require('fs-cli-goodies')
// const inquirer = require('inquirer')
const osUtils = require('./osUtils')

module.exports = {
  installFrontierDependencies,
  promptForConfig,
}

const polymerFromCDNCode = `
  <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.2.7/webcomponents-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.2.7/custom-elements-es5-adapter.js"></script>
 `
const depsToInstall = []
const devDepsToInstall = []

async function promptForConfig() {
  console.log(fsCli.fsLogo('Frontier React Scripts'))
  // when in CI, don't prompt, just accept defaults
  if (process.env.CI === 'true') {
    console.log('CI detected, skipping prompts and returning defaults ...')
    return Promise.resolve({ additionalFeatures: [] })
  }
  // Commenting this out for now, because we are likely going to be prompting for team owners and/or additional things soon
  // const questions = [
  //   {
  //     type: 'checkbox',
  //     name: 'additionalFeatures',
  //     message: 'What additional features does your app require (these are checkboxes)',
  //     choices: [
  //       {
  //         name: 'Using a shared Polymer Component within your React App?',
  //         value: 'polymer',
  //       },
  //     ],
  //   },
  // ]
  // const answers = await inquirer.prompt(questions)
  // return answers
  return Promise.resolve({ additionalFeatures: [] })
}

function installFrontierDependencies(appPath, appName, answers, ownPath) {
  const { additionalFeatures } = answers
  const usePolymer = additionalFeatures.includes('polymer')
  const useHF = true

  configureEF(appPath, ownPath, appName)
  configureHF(appPath, ownPath)
  // we always call this handle function. If usePolymer is false, it will remove the comments that we manually placed in the index file
  handlePolymerCodeAndComments(appPath, usePolymer, useHF)

  depsToInstall.push(
    ...[
      '@emotion/core@10',
      '@fs/zion-avatar',
      '@fs/zion-axios',
      '@fs/zion-button',
      '@fs/zion-card',
      '@fs/zion-chip',
      '@fs/zion-dialog',
      '@fs/zion-frontend-friends',
      '@fs/zion-grid',
      '@fs/zion-locale',
      '@fs/zion-root',
      '@fs/zion-router',
      '@fs/zion-style-normalize',
      '@fs/zion-subnav',
      '@fs/zion-theme',
      '@fs/zion-user',
      '@material-ui/core@4.0.0-beta.2',
      '@material-ui/styles@4.0.0-beta.2',
      'i18next@15',
      'react-i18next@10',
      'prop-types@15',
    ]
  )
  devDepsToInstall.push(
    ...[
      '@storybook/addon-actions@5',
      '@storybook/addon-a11y',
      '@storybook/addon-console@1',
      '@storybook/addon-info@5',
      '@storybook/addon-knobs@5',
      '@storybook/addon-viewport@5',
      '@storybook/addons@5',
      '@storybook/react@5',
      'storybook-readme@5',
      '@fs/eslint-config-frontier-react',
      '@fs/babel-preset-frontier',
      '@fs/storybook-addons',
      '@fs/zion-testing-library',
      '@fs/zion-style-normalize',
      '@fs/zion-theme',
      'eslint@5',
      'i18next-scanner@2',
      '@alienfast/i18next-loader@1',
      'dotenv@7',
      'jest-dom@3',
      'http-proxy-middleware@0.19',
    ]
  )

  alterPackageJsonFile(appPath, appPackage => {
    const packageJson = { ...appPackage }
    const additionalScripts = {
      'locales:sync': `i18next-scanner --output src/locales 'src/**/*.js'`,
      storybook: 'start-storybook --port 5009',
      'storybook:build': 'NODE_ENV=development build-storybook -c .storybook -o build',
      lint: 'eslint src/',
      'lint:fix': 'eslint src/ --fix',
      test: `eslint src/ && ${packageJson.scripts.test}`,
    }
    packageJson.scripts = { ...packageJson.scripts, ...additionalScripts }
    delete packageJson.scripts.eject
    packageJson.eslintConfig = {
      extends: ['@fs/eslint-config-frontier-react'],
    }
    return packageJson
  })
  installModulesSync(depsToInstall)
  installModulesSync(devDepsToInstall, true)

  syncLocales()

  replaceStringInFile(appPath, './README.md', /\{GITHUB_REPO\}/g, appName)
}

function handlePolymerCodeAndComments(appPath, usePolymer, useHF) {
  const polymerComment = '<!-- FRONTIER WEBCOMPONENT LOADER CODE FRONTIER -->'
  let filePath = 'public/index.html'
  if (useHF) {
    filePath = 'views/index.ejs'
  }

  if (usePolymer) {
    replaceStringInFile(appPath, filePath, polymerComment, polymerFromCDNCode)
  } else {
    replaceStringInFile(appPath, filePath, polymerComment, '')
  }
}

function alterPackageJsonFile(appPath, extendFunction) {
  let appPackage = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json'), 'UTF8'))
  appPackage = extendFunction(appPackage)
  fs.writeFileSync(path.join(appPath, 'package.json'), JSON.stringify(appPackage, null, 2) + os.EOL)
}

function replaceStringInFile(appPath, fileToInjectIntoPath, stringToReplace, stringToInject) {
  const indexPath = path.join(appPath, fileToInjectIntoPath)
  let indexCode = fs.readFileSync(indexPath, 'UTF8')

  indexCode = indexCode.replace(stringToReplace, stringToInject)
  fs.writeFileSync(indexPath, indexCode)
}

function configureEF(appPath, ownPath, appName) {
  // TODO - modify package.json to make sure name is correct for blueprint
  // TODO - use blueprint.yml as a template

  const templatePath = path.join(ownPath, 'template-ef')
  fs.copySync(templatePath, appPath, { overwrite: true })

  alterPackageJsonFile(appPath, appPackage => {
    const packageJson = { ...appPackage }
    const additionalScripts = {
      'heroku-prebuild': './heroku-prebuild.sh',
    }
    packageJson.scripts = sortScripts({ ...packageJson.scripts, ...additionalScripts })
    return packageJson
  })

  depsToInstall.push(...['express@4.16.4'])
  replaceStringInFile(appPath, './blueprint.yml', /\{\{APP_NAME\}\}/g, appName)
}

function configureHF(appPath, ownPath) {
  const templatePath = path.join(ownPath, 'template-hf')
  fs.copySync(templatePath, appPath, { overwrite: true })

  alterPackageJsonFile(appPath, appPackage => {
    const packageJson = { ...appPackage }
    const additionalScripts = {
      'build:prod': 'PUBLIC_URL=https://edge.fscdn.org/assets/ react-scripts build',
      'heroku-postbuild': 'npm run build:prod',
      start: 'react-scripts start',
    }
    packageJson.scripts = sortScripts({ ...packageJson.scripts, ...additionalScripts })
    packageJson.main = './index.js'
    packageJson.engines = { node: '10' }

    return packageJson
  })

  createLocalEnvFile()
  depsToInstall.push(...['github:fs-webdev/snow#cra', 'github:fs-webdev/startup'])
}

function installModulesSync(modules, saveDev = false) {
  const command = 'npm'
  const args = ['install', `--save${saveDev ? '-dev' : ''}`].concat(modules)
  osUtils.runExternalCommandSync(command, args)
}

function createLocalEnvFile() {
  osUtils.runExternalCommandSync('npx', ['@fs/fr-cli', 'env', 'local'])
}

function syncLocales() {
  osUtils.runExternalCommandSync('npm', ['run', 'locales:sync'])
}

function sortScripts(scripts) {
  const sortedScripts = {}
  Object.keys(scripts)
    .sort()
    .forEach(function(key) {
      sortedScripts[key] = scripts[key]
    })
  return sortedScripts
}

'use strict'

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const osUtils = require('./osUtils')

module.exports = {
  installFrontierDependencies,
}

const depsToInstall = []
const devDepsToInstall = []

function installFrontierDependencies(appPath, appName, ownPath) {
  configureEF(appPath, ownPath, appName)
  configureHF(appPath, ownPath)

  depsToInstall.push(
    ...[
      '@emotion/core@10',
      '@fs/zion-axios',
      '@fs/zion-cache',
      '@fs/zion-frontend-friends',
      '@fs/zion-icon',
      '@fs/zion-locale',
      '@fs/zion-root',
      '@fs/zion-router',
      '@fs/zion-style-normalize',
      '@fs/zion-subnav',
      '@fs/zion-user',
      '@fs/zion-ui',
      'formik@1',
      'i18next@15',
      'react-i18next@10',
      'prop-types@15',
      'yup@0.27',
    ]
  )
  devDepsToInstall.push(
    ...[
      '@storybook/addon-actions@5',
      '@storybook/addon-a11y',
      '@storybook/addon-console@1',
      '@storybook/addon-info@5',
      '@storybook/addon-knobs@5',
      '@storybook/addon-storysource@5',
      '@storybook/addon-viewport@5',
      '@storybook/addons@5',
      '@storybook/react@5',
      'storybook-readme@5',
      '@fs/eslint-config-frontier-react',
      '@fs/babel-preset-frontier',
      '@fs/storybook-addons',
      '@fs/zion-testing-library',
      '@fs/zion-style-normalize',
      'core-js@2',
      'eslint@5',
      'i18next-scanner@2',
      '@alienfast/i18next-loader@1',
      'dotenv@7',
      'jest-dom@3',
      'http-proxy-middleware@0.19',
      'husky@2',
      'lint-staged@8',
      'suppress-exit-code@0.1',
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
    }
    packageJson.scripts = { ...packageJson.scripts, ...additionalScripts }
    delete packageJson.scripts.eject
    packageJson.eslintConfig = { extends: ['@fs/eslint-config-frontier-react'] }
    packageJson.husky = {
      hooks: { 'pre-commit': 'lint-staged', 'pre-push': 'npm run lint && CI=true npm test' },
    }
    packageJson['lint-staged'] = { '*.js': ['suppress-exit-code eslint --fix', 'git add'] }
    return packageJson
  })
  installModulesSync(depsToInstall)
  installModulesSync(devDepsToInstall, true)

  syncLocales()

  replaceStringInFile(appPath, './README.md', /\{GITHUB_REPO\}/g, appName)
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
      'heroku-prebuild': './heroku-prebuild.sh',
      start: 'react-scripts start',
    }
    packageJson.scripts = sortScripts({
      ...packageJson.scripts,
      ...additionalScripts,
    })
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

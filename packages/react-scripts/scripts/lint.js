'use strict'
const path = require('path')
const paths = require('../config/paths')
const spawn = require('react-dev-utils/crossSpawn')

const args = process.argv.slice(2)
const scriptIndex = args.indexOf('lint')

const argsLint = [].concat('-c', path.resolve(paths.ownPath, './scripts/utils/.eslintrc.js'))
  .concat(args.slice(scriptIndex + 1))
  .concat(path.resolve(paths.appPath, 'src'))

// console.log(argsLint)

const result = spawn.sync(
  path.resolve(paths.ownPath, './node_modules/eslint/bin/eslint.js'),
  argsLint,
  { stdio: 'inherit' }
)
if (result.signal) {
  if (result.signal === 'SIGKILL') {
    console.log(
      'The build failed because the process exited too early. ' +
      'This probably means the system ran out of memory or someone called ' +
      '`kill -9` on the process.'
    )
  } else if (result.signal === 'SIGTERM') {
    console.log(
      'The build failed because the process exited too early. ' +
      'Someone might have called `kill` or `killall`, or the system could ' +
      'be shutting down.'
    )
  }
  process.exit(1)
}
process.exit(result.status)


'use strict'
const path = require('path')
const paths = require('../config/paths')
const fs = require('fs')

const args = process.argv.slice(2)

const mapToFile = {
  'eslintrc': '.eslintrc.js',
  '.eslintrc.js': '.eslintrc.js',
  '.eslintrc': '.eslintrc.js',
  'eslint': '.eslintrc.js',
  'lint': '.eslintrc.js',
  '.babelrc': '.babelrc',
  'babelrc': '.babelrc',
  'babel': '.babelrc',
}

args.forEach(arg => {
  const file = mapToFile[arg]
  if (file) {
    fs.createReadStream(path.resolve(paths.ownPath, './scripts/utils', file))
      .pipe(fs.createWriteStream(path.resolve(paths.appPath, file)));
  }
})

'use strict';

const paths = require('../config/paths');
const spawn = require('react-dev-utils/crossSpawn');
const chalk = require('chalk');

console.log(
  `Formatting your code with ${chalk.magenta('prettier-eslint')} 💅💅💅`
);
// Calls the prettier-eslint-cli command with --write
// this will format every .js file in the src/ folder
const prettierEslint = spawn.sync(
  'prettier-eslint',
  ['--write', `"${paths.appSrc}/**/*.js"`],
  { shell: true, stdio: 'inherit' }
);
if (prettierEslint.status !== 0) {
  console.log('There was an error while formatting.');
}

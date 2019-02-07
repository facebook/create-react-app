const paths = require('../config/paths');
const { exec } = require('child_process');

const isCI = process.env.CI === 'true'

const prettierMatch = paths.appSrc + '/**/*.{html,json,css,scss,mdx}';
const prettierCommand = `prettier '${prettierMatch}' ${isCI ? '--check' : '--write'} --end-of-line lf`;

const eslintConfigPath = paths.ownPath + '/config/.eslintrc';
const eslintIgnorePath = paths.ownPath + '/config/.eslintignore';
const eslintCommand = `eslint ${isCI ? '' : '--fix'} --config ${eslintConfigPath} --ignore-path ${eslintIgnorePath} --ext .jsx,.js src/`;

exec(prettierCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(stdout);
    console.log(stderr);
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log(stdout);
  console.log(stderr);
});

exec(eslintCommand, (error, stdout, stderr) => {
  if (error) {
    console.log(stdout);
    console.log(stderr);
    console.log('Error: ' + error);
    process.exit(1);
  }
  console.log(stdout);
  console.log(stderr);
  process.exit(0);
});
